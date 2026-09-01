"""
CodeMentor AI Agent Planner and Orchestrator.
Coordinates conversational DSA mentorship, intent routing, dynamic tool execution,
and multi-problem session context synchronization.
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
    ChatMessageRecord,
)
from .prompts import CODEMENTOR_SYSTEM_INSTRUCTIONS
from .intents import build_default_next_actions
from .tools import (
    open_problem_setup_form,
    explain_problem_tool,
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
from backend.services.conversation import get_conversation_service

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


class DSAPlanner:
    def __init__(self):
        self.session_service = get_session_service()
        self.conversation_service = get_conversation_service()
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    def _is_analysis_requested(self, query: str) -> bool:
        """Check if query requests code/solution analysis."""
        q = query.lower()
        triggers = [
            "analyze", "is my solution", "is this correct", "why is my code wrong",
            "why is my solution wrong", "why is it wrong", "find bug", "debug",
            "counterexample", "dry run", "trace", "explain my approach",
            "understand my approach", "check my code", "review my solution",
            "what is wrong", "fix my code", "how does my code"
        ]
        return any(t in q for t in triggers)

    def _is_solution_requested(self, query: str) -> bool:
        """Check if query asks to provide/generate/solve a problem."""
        q = query.lower()
        triggers = [
            "provide solution", "give solution", "show solution", "solve this",
            "solve the problem", "how to solve", "optimal solution", "optimal approach",
            "write solution", "code for this", "give me the code", "solution for"
        ]
        return any(t in q for t in triggers)

    def _is_dry_run_requested(self, query: str) -> bool:
        """Check if query explicitly requests dry run."""
        q = query.lower()
        return "dry run" in q or "trace" in q or "visualize execution" in q or "show the dry run" in q

    def _detect_and_update_new_problem(
        self, session: DSASessionContext, query: str
    ) -> Tuple[DSASessionContext, bool]:
        """
        Detects if the user is introducing a new DSA problem statement or new solution code
        within an ongoing chat session. If detected, updates MongoDB context in-place.
        """
        indicators = [
            "new problem", "another problem", "next problem", "let's solve", "now solve",
            "given an array", "given a string", "given an integer", "given the head",
            "given two", "given a binary", "given a linked", "class Solution",
            "def ", "vector<", "public int", "function ", "func ", "fn ", "```"
        ]
        q_lower = query.lower()
        has_indicator = any(ind in q_lower for ind in indicators) or len(query) > 100

        if not has_indicator:
            return session, False

        sys_prompt = """You are a DSA problem & code extractor.
Analyze the user's message to determine if they are providing or updating a problem statement or solution code.
Return JSON with:
- is_new_problem: true if a problem statement or solution code is provided in this message, else false
- problem: extracted problem statement text (or null if not provided in message)
- solution: extracted code snippet (or null if not provided in message)
- language: detected programming language (cpp, python, java, javascript, go, rust) or null
- active_input: sample input if provided or null
"""
        try:
            config = types.GenerateContentConfig(
                system_instruction=sys_prompt,
                response_mime_type="application/json",
                temperature=0.1,
            )
            res = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=query,
                config=config,
            )
            data = json.loads(res.text or "{}")
            if data.get("is_new_problem"):
                new_prob = data.get("problem") or session.problem
                new_sol = data.get("solution") or session.solution
                new_lang = data.get("language") or session.language or "cpp"
                new_input = data.get("active_input") or session.active_input or ""

                if (new_prob and new_prob != session.problem) or (new_sol and new_sol != session.solution):
                    updated_session = self.session_service.update_context(
                        session_id=session.session_id,
                        problem=new_prob or "",
                        solution=new_sol or "",
                        language=new_lang,
                        active_input=new_input,
                    )
                    return updated_session, True
        except Exception as e:
            logger.warning(f"[DSAPlanner] Failed to detect new problem: {e}")

        return session, False

    def _build_context_prompt(
        self,
        session: DSASessionContext,
        user_query: str,
        recent_messages: Optional[List[ChatMessageRecord]] = None,
    ) -> str:
        """Inject active DSA workspace context AND recent chat history into the agent prompt."""
        context_parts = []
        if session.problem:
            context_parts.append(f"Active Problem Statement:\n{session.problem}")
        if session.language:
            context_parts.append(f"Active Programming Language: {session.language}")
        if session.solution:
            context_parts.append(f"Active User Solution Code:\n{session.solution}")
        if session.active_input:
            context_parts.append(f"Active Example Input:\n{session.active_input}")
        if session.test_cases:
            context_parts.append("Active Test Cases:\n" + "\n".join(f"- {tc}" for tc in session.test_cases))
        if session.problem_understanding:
            context_parts.append(
                f"Problem Pattern/Objective: {session.problem_understanding.get('pattern', '')} - "
                f"{session.problem_understanding.get('objective', '')}"
            )

        history_str = ""
        if recent_messages:
            history_lines = []
            for msg in recent_messages[-6:]:
                role_label = "User" if msg.role == "user" else "CodeMentor"
                history_lines.append(f"{role_label}: {msg.content}")
            if history_lines:
                history_str = (
                    "\n[RECENT CONVERSATION HISTORY IN THIS SESSION]\n"
                    + "\n".join(history_lines)
                    + "\n[END CONVERSATION HISTORY]\n"
                )

        if context_parts or history_str:
            context_str = "\n---\n".join(context_parts)
            return (
                f"[CURRENT PERSISTED DSA WORKSPACE CONTEXT]\n"
                f"{context_str}\n"
                f"[END PERSISTED CONTEXT]\n"
                f"{history_str}\n"
                f"User Request: {user_query}"
            )
        return user_query

    async def execute_query(
        self,
        session_id: str,
        user_id: str,
        query: str,
        is_new_session: bool = False,
    ) -> AgentResponse:
        """
        Execute user query within the persistent DSA session.
        Seamlessly coordinates intent matching, tool execution, structured UI component delivery,
        and multi-problem conversational continuity.
        """
        session = self.session_service.get_or_create_session(session_id=session_id, user_id=user_id)
        recent_messages = self.conversation_service.get_messages(session_id=session_id, limit=10)
        clean_query = query.strip()
        q_lower = clean_query.lower()

        # Check if user introduced a new problem or solution in this chat message
        session, is_switched = self._detect_and_update_new_problem(session, clean_query)

        has_problem = bool(session.problem and session.problem.strip())
        has_solution = bool(session.solution and session.solution.strip())

        # -------------------------------------------------------------
        # 1. EXPLICIT FORM OPEN REQUEST
        # -------------------------------------------------------------
        if "setup" in q_lower or "problem setup form" in q_lower or "open form" in q_lower:
            form_tool_res = open_problem_setup_form(
                problem=session.problem or "",
                solution=session.solution or "",
                language=session.language or "cpp",
                active_input=session.active_input or "",
            )
            return AgentResponse(
                session_id=session.session_id,
                response=form_tool_res["response"],
                intent=form_tool_res["intent"],
                structured_data=form_tool_res["structured_data"],
                next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                dsa_context=session.model_dump(),
                new_session=is_new_session,
            )

        # -------------------------------------------------------------
        # 2. ON-DEMAND DRY RUN REQUEST
        # -------------------------------------------------------------
        if self._is_dry_run_requested(clean_query):
            if not has_problem and not has_solution:
                form_tool_res = open_problem_setup_form()
                return AgentResponse(
                    session_id=session.session_id,
                    response="To visualize a dry run, please provide the problem statement and your solution code in the setup form below.",
                    intent=form_tool_res["intent"],
                    structured_data=form_tool_res["structured_data"],
                    next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

            # Generate dry run using problem and/or code
            dry_run_res = await generate_dry_run_tool(
                problem_statement=session.problem or "Sample DSA Problem",
                solution_code=session.solution or "",
                language=session.language or "cpp",
                example_input=session.active_input or "",
            )
            return AgentResponse(
                session_id=session.session_id,
                response=dry_run_res["response"],
                intent=dry_run_res["intent"],
                structured_data=dry_run_res["structured_data"],
                next_actions=[NextAction(**a) for a in dry_run_res["next_actions"]],
                dsa_context=session.model_dump(),
                new_session=is_new_session,
            )

        # -------------------------------------------------------------
        # 3. SOLVE / PROVIDE SOLUTION REQUEST (even if user gave NO code)
        # -------------------------------------------------------------
        if self._is_solution_requested(clean_query) or "optimal solution" in q_lower or "how to solve" in q_lower:
            if has_problem:
                opt_res = optimize_solution_tool(
                    problem_statement=session.problem or "",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=opt_res["response"],
                    intent=opt_res["intent"],
                    structured_data=opt_res["structured_data"],
                    next_actions=[NextAction(**a) for a in opt_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                form_tool_res = open_problem_setup_form()
                return AgentResponse(
                    session_id=session.session_id,
                    response="I'd be glad to provide the optimal solution and complete breakdown! Please provide the problem statement in the form below (or paste it directly in chat).",
                    intent=form_tool_res["intent"],
                    structured_data=form_tool_res["structured_data"],
                    next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # -------------------------------------------------------------
        # 4. DEBUG / FIND BUG / WHY IS CODE WRONG
        # -------------------------------------------------------------
        if "why is" in q_lower or "bug" in q_lower or "wrong" in q_lower or "debug" in q_lower or "fails" in q_lower:
            if has_solution:
                dbg_res = debug_solution_tool(
                    problem_statement=session.problem or "Analyzed DSA Problem",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=dbg_res["response"],
                    intent=dbg_res["intent"],
                    structured_data=dbg_res["structured_data"],
                    next_actions=[NextAction(**a) for a in dbg_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                form_tool_res = open_problem_setup_form(problem=session.problem or "")
                return AgentResponse(
                    session_id=session.session_id,
                    response="To debug your logic and identify edge-case failures, please enter your solution code in the setup form below.",
                    intent=form_tool_res["intent"],
                    structured_data=form_tool_res["structured_data"],
                    next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # -------------------------------------------------------------
        # 5. COUNTEREXAMPLE / FAILING TEST CASE
        # -------------------------------------------------------------
        if "counterexample" in q_lower or "failing test" in q_lower or "edge case" in q_lower:
            if has_solution:
                ce_res = generate_counterexample_tool(
                    problem_statement=session.problem or "DSA Problem",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=ce_res["response"],
                    intent=ce_res["intent"],
                    structured_data=ce_res["structured_data"],
                    next_actions=[NextAction(**a) for a in ce_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            elif has_problem:
                exp_res = explain_problem_tool(problem_statement=session.problem or "")
                return AgentResponse(
                    session_id=session.session_id,
                    response=exp_res["response"],
                    intent=exp_res["intent"],
                    structured_data=exp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in exp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                form_tool_res = open_problem_setup_form()
                return AgentResponse(
                    session_id=session.session_id,
                    response="To generate a failing counterexample, please provide your solution code and problem statement in the form below.",
                    intent=form_tool_res["intent"],
                    structured_data=form_tool_res["structured_data"],
                    next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # -------------------------------------------------------------
        # 6. UNDERSTAND APPROACH / ANALYZE SOLUTION
        # -------------------------------------------------------------
        if "approach" in q_lower or "analyze" in q_lower or "review" in q_lower or "understand my" in q_lower or "explain my" in q_lower:
            if has_solution:
                ana_res = analyze_solution_tool(
                    problem_statement=session.problem or "DSA Code Logic",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                    example_input=session.active_input or "",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=ana_res["response"],
                    intent=ana_res["intent"],
                    structured_data=ana_res["structured_data"],
                    next_actions=[NextAction(**a) for a in ana_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            elif has_problem:
                exp_res = explain_problem_tool(problem_statement=session.problem or "")
                return AgentResponse(
                    session_id=session.session_id,
                    response=exp_res["response"],
                    intent=exp_res["intent"],
                    structured_data=exp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in exp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                form_tool_res = open_problem_setup_form()
                return AgentResponse(
                    session_id=session.session_id,
                    response="I'm ready to analyze your approach! Please enter your problem statement or solution code in the setup form below.",
                    intent=form_tool_res["intent"],
                    structured_data=form_tool_res["structured_data"],
                    next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # -------------------------------------------------------------
        # 7. COMPLEXITY ANALYSIS
        # -------------------------------------------------------------
        if "complexity" in q_lower or "big o" in q_lower or "time complexity" in q_lower or "space complexity" in q_lower:
            if has_solution:
                cmplx_res = explain_complexity_tool(
                    problem_statement=session.problem or "",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=cmplx_res["response"],
                    intent=cmplx_res["intent"],
                    structured_data=cmplx_res["structured_data"],
                    next_actions=[NextAction(**a) for a in cmplx_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            elif has_problem:
                exp_res = explain_problem_tool(problem_statement=session.problem or "")
                return AgentResponse(
                    session_id=session.session_id,
                    response=exp_res["response"],
                    intent=exp_res["intent"],
                    structured_data=exp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in exp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # -------------------------------------------------------------
        # 8. COMPARE SOLUTIONS
        # -------------------------------------------------------------
        if "compare" in q_lower:
            if has_solution:
                cmp_res = compare_solutions_tool(
                    problem_statement=session.problem or "",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=cmp_res["response"],
                    intent=cmp_res["intent"],
                    structured_data=cmp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in cmp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # -------------------------------------------------------------
        # 9. SHOW FIX / CORRECTED CODE
        # -------------------------------------------------------------
        if "fix" in q_lower or "corrected" in q_lower:
            if has_solution:
                fix_res = show_fix_tool(
                    problem_statement=session.problem or "",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=fix_res["response"],
                    intent=fix_res["intent"],
                    structured_data=fix_res["structured_data"],
                    next_actions=[NextAction(**a) for a in fix_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # -------------------------------------------------------------
        # 10. EXPLAIN PROBLEM STATEMENT
        # -------------------------------------------------------------
        if "explain problem" in q_lower or "understand problem" in q_lower or "problem breakdown" in q_lower:
            if has_problem:
                exp_res = explain_problem_tool(problem_statement=session.problem or "")
                return AgentResponse(
                    session_id=session.session_id,
                    response=exp_res["response"],
                    intent=exp_res["intent"],
                    structured_data=exp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in exp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                form_tool_res = open_problem_setup_form()
                return AgentResponse(
                    session_id=session.session_id,
                    response="Please provide the problem statement in the form below so I can break it down.",
                    intent=form_tool_res["intent"],
                    structured_data=form_tool_res["structured_data"],
                    next_actions=[NextAction(**a) for a in form_tool_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # -------------------------------------------------------------
        # 11. GENERAL CHAT / THEORETICAL CONCEPTS
        # -------------------------------------------------------------
        augmented_prompt = self._build_context_prompt(session, clean_query, recent_messages)
        sys_prompt = CODEMENTOR_SYSTEM_INSTRUCTIONS + """
CRITICAL: Return a JSON object with:
- response: your comprehensive, insightful, encouraging conversational markdown response
- next_actions: list of 2-3 contextual next action suggestion chips dynamically tailored to what was discussed. Each object must have:
  * label: short button title (1-3 words)
  * action_prompt: exact actionable query prompt to send
"""
        try:
            config = types.GenerateContentConfig(
                system_instruction=sys_prompt,
                response_mime_type="application/json",
                temperature=0.7,
            )
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=augmented_prompt,
                config=config,
            )
            data = json.loads(response.text or "{}")
            chat_text = data.get("response") or response.text or "I'm here to help with your DSA queries!"
            raw_actions = data.get("next_actions") or []
            actions = [
                NextAction(**a) for a in raw_actions
                if isinstance(a, dict) and a.get("label") and a.get("action_prompt")
            ]
            if not actions:
                actions = build_default_next_actions(
                    DSAIntent.GENERAL_CHAT.value,
                    {"problem": session.problem, "solution": session.solution}
                )
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
            new_session=is_new_session,
        )


_planner_instance: Optional[DSAPlanner] = None


def get_planner() -> DSAPlanner:
    global _planner_instance
    if _planner_instance is None:
        _planner_instance = DSAPlanner()
    return _planner_instance
