"""
CodeMentor AI Agent Planner and Orchestrator.
Coordinates conversational DSA mentorship, intent routing, tool execution,
and session context synchronization.
"""
import os
import re
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List, Tuple
from google import genai
from google.genai import types
from dotenv import load_dotenv

from .schemas import (
    AgentResponse,
    DSAIntent,
    NextAction,
    StructuredDataType,
    DSASessionContext,
)
from .prompts import CODEMENTOR_SYSTEM_INSTRUCTIONS
from .intents import build_default_next_actions
from .tools import (
    open_problem_setup_form,
    analyze_solution_tool,
    debug_solution_tool,
    generate_counterexample_tool,
    generate_dry_run_tool,
    show_fix_tool,
    optimize_solution_tool,
    compare_solutions_tool,
    explain_complexity_tool,
)
from backend.services.session import get_session_service

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


class DSAPlanner:
    def __init__(self):
        self.session_service = get_session_service()
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    def _is_analysis_requested(self, query: str) -> bool:
        """Check if query requests code/solution analysis."""
        q = query.lower()
        triggers = [
            "analyze", "is my solution", "is this correct", "why is my code wrong",
            "why is my solution wrong", "why is it wrong", "find bug", "debug",
            "counterexample", "dry run", "trace", "explain my approach",
            "check my code", "review my solution"
        ]
        return any(t in q for t in triggers)

    def _is_dry_run_requested(self, query: str) -> bool:
        """Check if query explicitly requests dry run."""
        q = query.lower()
        return "dry run" in q or "trace" in q or "visualize execution" in q or "show the dry run" in q

    def _build_context_prompt(self, session: DSASessionContext, user_query: str) -> str:
        """Inject active DSA workspace context into the agent prompt."""
        context_parts = []
        if session.problem:
            context_parts.append(f"Problem Statement:\n{session.problem}")
        if session.language:
            context_parts.append(f"Programming Language: {session.language}")
        if session.solution:
            context_parts.append(f"User Solution Code:\n{session.solution}")
        if session.active_input:
            context_parts.append(f"Example Input:\n{session.active_input}")
        if session.problem_understanding:
            context_parts.append(f"Problem Pattern/Objective: {session.problem_understanding.get('pattern', '')} - {session.problem_understanding.get('objective', '')}")

        if context_parts:
            context_str = "\n---\n".join(context_parts)
            return (
                f"[CURRENT PERSISTED DSA WORKSPACE CONTEXT]\n"
                f"{context_str}\n"
                f"[END PERSISTED CONTEXT]\n\n"
                f"User Request: {user_query}"
            )
        return user_query

    async def execute_query(
        self,
        session_id: str,
        user_id: str,
        query: str,
    ) -> AgentResponse:
        """
        Execute user query within the persistent DSA session.
        Determines whether to ask for missing context, route to tools,
        or handle conversational inquiry.
        """
        session = self.session_service.get_or_create_session(session_id=session_id, user_id=user_id)
        clean_query = query.strip()
        has_problem = bool(session.problem and session.problem.strip())
        has_solution = bool(session.solution and session.solution.strip())

        if "setup" in clean_query.lower() or "problem setup form" in clean_query.lower() or (
            self._is_analysis_requested(clean_query) and not has_problem
        ):
            form_tool_res = open_problem_setup_form(
                problem=session.problem or "",
                solution=session.solution or "",
                language=session.language or "cpp",
                active_input=session.active_input or "",
            )
            response_text = (
                "I've opened the Problem Setup form below. Please enter the problem statement, "
                "your solution code, and any optional sample input so we can begin the conceptual analysis!"
            )
            return AgentResponse(
                session_id=session.session_id,
                response=response_text,
                intent=form_tool_res["intent"],
                structured_data=form_tool_res["structured_data"],
                next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                dsa_context=session.model_dump(),
            )

        if self._is_dry_run_requested(clean_query):
            if not has_problem or not has_solution:
                form_tool_res = open_problem_setup_form()
                return AgentResponse(
                    session_id=session.session_id,
                    response="To visualize a dry run, I need both the problem statement and your solution code. Please provide them in the setup form below.",
                    intent=form_tool_res["intent"],
                    structured_data=form_tool_res["structured_data"],
                    next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                    dsa_context=session.model_dump(),
                )

            dry_run_res = await generate_dry_run_tool(
                problem_statement=session.problem,
                solution_code=session.solution,
                language=session.language or "cpp",
                example_input=session.active_input or "",
            )
            response_text = (
                f"Here is the conceptual dry-run trace for your solution. "
                f"It walks through the pointer updates and state transitions step by step."
            )
            return AgentResponse(
                session_id=session.session_id,
                response=response_text,
                intent=dry_run_res["intent"],
                structured_data=dry_run_res["structured_data"],
                next_actions=[NextAction(**a) for a in dry_run_res["next_actions"]],
                dsa_context=session.model_dump(),
            )

        q_lower = clean_query.lower()
        if has_problem and has_solution:
            if "counterexample" in q_lower:
                ce_res = generate_counterexample_tool(
                    problem_statement=session.problem,
                    solution_code=session.solution,
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response="Here is a concrete counterexample where your current solution produces an unexpected result.",
                    intent=ce_res["intent"],
                    structured_data=ce_res["structured_data"],
                    next_actions=[NextAction(**a) for a in ce_res["next_actions"]],
                    dsa_context=session.model_dump(),
                )
            elif "why is" in q_lower or "bug" in q_lower or "wrong" in q_lower or "debug" in q_lower:
                dbg_res = debug_solution_tool(
                    problem_statement=session.problem,
                    solution_code=session.solution,
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response="I've analyzed your logic and identified the bug along with why it fails and how to fix it.",
                    intent=dbg_res["intent"],
                    structured_data=dbg_res["structured_data"],
                    next_actions=[NextAction(**a) for a in dbg_res["next_actions"]],
                    dsa_context=session.model_dump(),
                )
            elif "optimal" in q_lower or "optimize" in q_lower:
                opt_res = optimize_solution_tool(
                    problem_statement=session.problem,
                    solution_code=session.solution,
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=f"Here is the optimal approach and implementation for this problem, improving on redundant computations.",
                    intent=opt_res["intent"],
                    structured_data=opt_res["structured_data"],
                    next_actions=[NextAction(**a) for a in opt_res["next_actions"]],
                    dsa_context=session.model_dump(),
                )
            elif "compare" in q_lower:
                cmp_res = compare_solutions_tool(
                    problem_statement=session.problem,
                    solution_code=session.solution,
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response="Here is a side-by-side comparison of your approach against the optimal solution.",
                    intent=cmp_res["intent"],
                    structured_data=cmp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in cmp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                )
            elif "complexity" in q_lower:
                cmplx_res = explain_complexity_tool(
                    problem_statement=session.problem,
                    solution_code=session.solution,
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response="Here is the detailed time and space complexity derivation for your code.",
                    intent=cmplx_res["intent"],
                    structured_data=cmplx_res["structured_data"],
                    next_actions=[NextAction(**a) for a in cmplx_res["next_actions"]],
                    dsa_context=session.model_dump(),
                )
            elif "fix" in q_lower or "corrected" in q_lower:
                fix_res = show_fix_tool(
                    problem_statement=session.problem,
                    solution_code=session.solution,
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response="Here is the corrected code for your approach.",
                    intent=fix_res["intent"],
                    structured_data=fix_res["structured_data"],
                    next_actions=[NextAction(**a) for a in fix_res["next_actions"]],
                    dsa_context=session.model_dump(),
                )
            elif "analyze" in q_lower or "approach" in q_lower:
                ana_res = analyze_solution_tool(
                    problem_statement=session.problem,
                    solution_code=session.solution,
                    language=session.language or "cpp",
                    example_input=session.active_input or "",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=f"Your solution has been analyzed. The approach uses {ana_res['structured_data']['algorithm']} with {ana_res['structured_data']['time_complexity']} time complexity.",
                    intent=ana_res["intent"],
                    structured_data=ana_res["structured_data"],
                    next_actions=[NextAction(**a) for a in ana_res["next_actions"]],
                    dsa_context=session.model_dump(),
                )

        augmented_prompt = self._build_context_prompt(session, clean_query)
        try:
            config = types.GenerateContentConfig(
                system_instruction=CODEMENTOR_SYSTEM_INSTRUCTIONS,
                temperature=0.7,
            )
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=augmented_prompt,
                config=config,
            )
            chat_text = response.text or "I'm here to help with your DSA queries!"
        except Exception as e:
            logger.error(f"[DSAPlanner] LLM generation failed: {e}")
            chat_text = "I'm ready to help you analyze your DSA problem and code. What would you like to explore?"

        actions = build_default_next_actions(
            DSAIntent.GENERAL_CHAT.value,
            {"problem": session.problem, "solution": session.solution}
        )

        return AgentResponse(
            session_id=session.session_id,
            response=chat_text,
            intent=DSAIntent.GENERAL_CHAT.value,
            structured_data=None,
            next_actions=actions,
            dsa_context=session.model_dump(),
        )


_planner_instance: Optional[DSAPlanner] = None


def get_planner() -> DSAPlanner:
    global _planner_instance
    if _planner_instance is None:
        _planner_instance = DSAPlanner()
    return _planner_instance
