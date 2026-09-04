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
    DSASessionContext,
    ChatMessageRecord,
)
from .prompts import (
    GENERAL_CHAT_SYSTEM_PROMPT,
    NON_DRY_RUN_IMAGE_REFUSAL_RESPONSE,
    build_auto_extract_prompt,
)
from .intents import build_default_next_actions
from .tools import (
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

    def _is_non_dry_run_image_request(self, query: str) -> bool:
        """
        Check if query asks for non-dry-run image/photo/drawing generation.
        Visual generation is strictly restricted to algorithmic dry-run execution traces.
        """
        q = query.lower().strip()
        if any(term in q for term in ["dry run", "dryrun", "trace", "execution trace", "step trace", "pointer step"]):
            return False

        image_triggers = [
            "generate image", "generate an image", "create an image", "create image",
            "draw an image", "draw a picture", "draw image", "make an image", "paint an image",
            "generate picture", "generate a photo", "create a picture", "draw a photo",
            "generate graphic", "generate illustration", "draw me a", "generate a visual of",
            "generate visuals of", "draw a ", "draw ", "paint "
        ]
        if any(t in q for t in image_triggers):
            return True

        if re.search(r"\b(image|picture|photo|drawing|illustration|artwork)\s+of\b", q):
            return True

        if re.search(r"\b(generate|create|draw|make|show)\s+(an?\s+)?(image|picture|photo|illustration|drawing|artwork)\b", q):
            return True

        return False

    def _sanitize_chat_response(self, text: str) -> str:
        """
        Guarantees that no raw internal JSON or metadata schemas leak into
        the conversational chat output presented to the user.
        """
        if not text:
            return ""

        cleaned = text.strip()

        code_block_match = re.search(r"^```(?:json)?\s*(\{[\s\S]*\})\s*```$", cleaned)
        if code_block_match:
            try:
                parsed = json.loads(code_block_match.group(1))
                if isinstance(parsed, dict):
                    if "response" in parsed and isinstance(parsed["response"], str):
                        return parsed["response"].strip()
                    elif "message" in parsed and isinstance(parsed["message"], str):
                        return parsed["message"].strip()
            except Exception:
                pass

        if cleaned.startswith("{") and cleaned.endswith("}"):
            try:
                parsed = json.loads(cleaned)
                if isinstance(parsed, dict):
                    if "response" in parsed and isinstance(parsed["response"], str):
                        return parsed["response"].strip()
                    elif "message" in parsed and isinstance(parsed["message"], str):
                        return parsed["message"].strip()
            except Exception:
                pass

        def _strip_internal_json_block(match: re.Match) -> str:
            content = match.group(1)
            internal_keys = ['"intent"', '"structured_data"', '"problem_understanding"', '"steps":', '"correctness_classification"']
            if any(k in content for k in internal_keys):
                return ""
            return match.group(0)

        cleaned = re.sub(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", _strip_internal_json_block, cleaned)

        return cleaned.strip()

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
        Intelligently detects if the user is providing code, stating a problem,
        referencing a known problem (e.g. '3Sum', 'Trapping Rain Water'), or asking to solve/analyze code.
        Automatically populates canonical problem statements, code, languages, and test cases
        into the persistent MongoDB context so manual feeding is never required.
        """
        clean_query = query.strip()
        q_lower = clean_query.lower()

        simple_chit_chat = [
            "hi", "hello", "hey", "hola", "good morning", "good evening",
            "who are you", "what can you do", "help", "thanks", "thank you",
            "cool", "nice", "awesome", "bye", "goodbye"
        ]
        if q_lower in simple_chit_chat:
            return session, False

        blind_questions = [
            "why is my solution wrong", "why is my code wrong", "why is it wrong",
            "is my solution correct", "is my code correct", "debug my code",
            "what is wrong with my code", "find bug in my code", "counterexample",
            "give me a counterexample"
        ]
        if q_lower in blind_questions and not any(ch in clean_query for ch in ["{", "}", "(", ")", "=", ";", ":", "\n"]):
            return session, False

        sys_prompt = build_auto_extract_prompt(
            active_problem=session.problem or "",
            has_code=bool(session.solution),
            language=session.language or "cpp",
        )
        try:
            config = types.GenerateContentConfig(
                system_instruction=sys_prompt,
                response_mime_type="application/json",
                temperature=0.1,
            )
            res = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=clean_query,
                config=config,
            )
            data = json.loads(res.text or "{}")
            if data.get("has_dsa_context"):
                prob_stmt = data.get("problem_statement")
                sol_code = data.get("solution")
                det_lang = data.get("language") or session.language or "cpp"
                test_cases = data.get("test_cases") or []
                active_in = data.get("active_input") or (test_cases[0] if test_cases else None)
                is_diff = data.get("is_different_problem", False)

                # If it is a brand-new or different problem:
                if is_diff or (prob_stmt and not session.problem):
                    new_prob = prob_stmt or session.problem
                    new_sol = sol_code if sol_code else (session.solution if not is_diff else None)
                    new_tc = test_cases if test_cases else session.test_cases
                    new_in = active_in if active_in else session.active_input

                    updated_session = self.session_service.update_context(
                        session_id=session.session_id,
                        problem=new_prob,
                        solution=new_sol,
                        language=det_lang,
                        active_input=new_in,
                        test_cases=new_tc,
                    )
                    logger.info(f"[DSAPlanner] Auto-populated problem context: {data.get('problem_title')} (is_diff={is_diff})")
                    return updated_session, True

                elif sol_code and sol_code != session.solution:
                    updated_session = self.session_service.update_context(
                        session_id=session.session_id,
                        solution=sol_code,
                        language=det_lang,
                        active_input=active_in or session.active_input,
                        test_cases=test_cases if test_cases else session.test_cases,
                    )
                    logger.info(f"[DSAPlanner] Auto-populated user code in context (lang={det_lang})")
                    return updated_session, True

        except Exception as e:
            logger.warning(f"[DSAPlanner] Failed to auto-extract problem context: {e}")

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

        session, is_switched = self._detect_and_update_new_problem(session, clean_query)

        has_problem = bool(session.problem and session.problem.strip())
        has_solution = bool(session.solution and session.solution.strip())

        if self._is_non_dry_run_image_request(clean_query):
            return AgentResponse(
                session_id=session.session_id,
                response=NON_DRY_RUN_IMAGE_REFUSAL_RESPONSE,
                intent=DSAIntent.GENERAL_CHAT.value,
                structured_data=None,
                next_actions=[
                    NextAction(label="Show Dry Run", action_prompt="Show me a step-by-step dry run"),
                    NextAction(label="Explain Problem", action_prompt="Explain the problem statement and constraints"),
                    NextAction(label="Optimal Solution", action_prompt="Show the optimal solution and approach"),
                ],
                dsa_context=session.model_dump(),
                new_session=is_new_session,
            )

        # 1. ON-DEMAND DRY RUN REQUEST
        if self._is_dry_run_requested(clean_query):
            if not has_problem and not has_solution:
                return AgentResponse(
                    session_id=session.session_id,
                    response="To visualize a dry run, please provide the problem statement and your solution code in the **Active Context** panel on the right (or paste them directly here in chat).",
                    intent=DSAIntent.GENERAL_CHAT.value,
                    structured_data=None,
                    next_actions=[
                        NextAction(label="Explain a DSA Concept", action_prompt="What is dynamic programming and when do we use it?"),
                        NextAction(label="Common Patterns", action_prompt="What are the most common DSA patterns used in technical interviews?"),
                    ],
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
                response=self._sanitize_chat_response(dry_run_res["response"]),
                intent=dry_run_res["intent"],
                structured_data=dry_run_res["structured_data"],
                next_actions=[NextAction(**a) for a in dry_run_res["next_actions"]],
                dsa_context=session.model_dump(),
                new_session=is_new_session,
            )

        # 2. SHOW FIX / CORRECTED CODE
        if "fix" in q_lower or "corrected" in q_lower or "correct my" in q_lower:
            if has_solution:
                fix_res = show_fix_tool(
                    problem_statement=session.problem or "",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                if fix_res.get("structured_data") and fix_res["structured_data"].get("corrected_code"):
                    corrected_code = fix_res["structured_data"]["corrected_code"]
                    session = self.session_service.update_context(
                        session_id=session.session_id,
                        solution=corrected_code,
                        language=session.language or "cpp",
                    )
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(fix_res["response"]),
                    intent=fix_res["intent"],
                    structured_data=fix_res["structured_data"],
                    next_actions=[NextAction(**a) for a in fix_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            elif has_problem:
                opt_res = optimize_solution_tool(
                    problem_statement=session.problem or "",
                    solution_code="",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(opt_res["response"]),
                    intent=opt_res["intent"],
                    structured_data=opt_res["structured_data"],
                    next_actions=[NextAction(**a) for a in opt_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                return AgentResponse(
                    session_id=session.session_id,
                    response="To provide a fix or corrected code, please provide your solution code in the **Active Context** panel on the right (or paste it directly in chat).",
                    intent=DSAIntent.GENERAL_CHAT.value,
                    structured_data=None,
                    next_actions=[
                        NextAction(label="Common Patterns", action_prompt="What are the most common DSA patterns used in technical interviews?"),
                    ],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # 3. DEBUG / FIND BUG / WHY IS CODE WRONG
        if "why is" in q_lower or "bug" in q_lower or "wrong" in q_lower or "debug" in q_lower or "fails" in q_lower:
            if has_solution:
                dbg_res = debug_solution_tool(
                    problem_statement=session.problem or "Analyzed DSA Problem",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(dbg_res["response"]),
                    intent=dbg_res["intent"],
                    structured_data=dbg_res["structured_data"],
                    next_actions=[NextAction(**a) for a in dbg_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                return AgentResponse(
                    session_id=session.session_id,
                    response="To debug your logic and identify edge-case failures, please enter your solution code in the **Active Context** panel on the right (or paste it directly in chat).",
                    intent=DSAIntent.GENERAL_CHAT.value,
                    structured_data=None,
                    next_actions=[
                        NextAction(label="Analyze Approach", action_prompt="Can you explain how to debug edge cases in algorithms?"),
                    ],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # 4. COUNTEREXAMPLE / FAILING TEST CASE
        if "counterexample" in q_lower or "failing test" in q_lower or "edge case" in q_lower or "break my code" in q_lower:
            if has_solution:
                ce_res = generate_counterexample_tool(
                    problem_statement=session.problem or "DSA Problem",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(ce_res["response"]),
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
                    response=self._sanitize_chat_response(exp_res["response"]),
                    intent=exp_res["intent"],
                    structured_data=exp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in exp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                return AgentResponse(
                    session_id=session.session_id,
                    response="To generate a failing counterexample, please enter your solution code and problem statement in the **Active Context** panel on the right (or paste them directly in chat).",
                    intent=DSAIntent.GENERAL_CHAT.value,
                    structured_data=None,
                    next_actions=[
                        NextAction(label="Common Edge Cases", action_prompt="What are the most common edge cases to watch out for in arrays and strings?"),
                    ],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # 5. SOLVE / PROVIDE SOLUTION / OPTIMAL SOLUTION
        if self._is_solution_requested(clean_query) or "optimal" in q_lower or "how to solve" in q_lower or "solve this" in q_lower:
            if has_problem:
                opt_res = optimize_solution_tool(
                    problem_statement=session.problem or "",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                if opt_res.get("structured_data") and opt_res["structured_data"].get("optimal_code"):
                    optimal_code = opt_res["structured_data"]["optimal_code"]
                    if not session.solution or not session.solution.strip():
                        session = self.session_service.update_context(
                            session_id=session.session_id,
                            solution=optimal_code,
                            language=session.language or "cpp",
                        )
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(opt_res["response"]),
                    intent=opt_res["intent"],
                    structured_data=opt_res["structured_data"],
                    next_actions=[NextAction(**a) for a in opt_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                return AgentResponse(
                    session_id=session.session_id,
                    response="I'd be glad to provide the optimal solution and complete breakdown! Please provide the problem statement in the **Active Context** panel on the right (or paste it directly in chat).",
                    intent=DSAIntent.GENERAL_CHAT.value,
                    structured_data=None,
                    next_actions=[
                        NextAction(label="Common Patterns", action_prompt="What are the most common DSA patterns used in technical interviews?"),
                        NextAction(label="Two Pointers vs Hash Map", action_prompt="When should I use Two Pointers vs Hash Map?"),
                    ],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # 6. COMPLEXITY ANALYSIS
        if "complexity" in q_lower or "big o" in q_lower or "time complexity" in q_lower or "space complexity" in q_lower:
            if has_solution:
                cmplx_res = explain_complexity_tool(
                    problem_statement=session.problem or "",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(cmplx_res["response"]),
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
                    response=self._sanitize_chat_response(exp_res["response"]),
                    intent=exp_res["intent"],
                    structured_data=exp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in exp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # 7. COMPARE SOLUTIONS
        if "compare" in q_lower:
            if has_solution:
                cmp_res = compare_solutions_tool(
                    problem_statement=session.problem or "",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(cmp_res["response"]),
                    intent=cmp_res["intent"],
                    structured_data=cmp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in cmp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # 8. EXPLAIN PROBLEM STATEMENT
        if "explain problem" in q_lower or "understand problem" in q_lower or "problem breakdown" in q_lower or "clarify problem" in q_lower:
            if has_problem:
                exp_res = explain_problem_tool(problem_statement=session.problem or "")
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(exp_res["response"]),
                    intent=exp_res["intent"],
                    structured_data=exp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in exp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                return AgentResponse(
                    session_id=session.session_id,
                    response="Please enter the problem statement in the **Active Context** panel on the right (or paste it directly in chat) so I can break it down for you.",
                    intent=DSAIntent.GENERAL_CHAT.value,
                    structured_data=None,
                    next_actions=[
                        NextAction(label="Common Patterns", action_prompt="What are the most common DSA patterns used in technical interviews?"),
                    ],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # 9. UNDERSTAND APPROACH / ANALYZE SOLUTION
        if "approach" in q_lower or "analyze" in q_lower or "review" in q_lower or "understand my" in q_lower or "explain my" in q_lower or "is my solution" in q_lower or "check my code" in q_lower:
            if has_solution:
                ana_res = analyze_solution_tool(
                    problem_statement=session.problem or "DSA Code Logic",
                    solution_code=session.solution or "",
                    language=session.language or "cpp",
                    example_input=session.active_input or "",
                )
                return AgentResponse(
                    session_id=session.session_id,
                    response=self._sanitize_chat_response(ana_res["response"]),
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
                    response=self._sanitize_chat_response(exp_res["response"]),
                    intent=exp_res["intent"],
                    structured_data=exp_res["structured_data"],
                    next_actions=[NextAction(**a) for a in exp_res["next_actions"]],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )
            else:
                return AgentResponse(
                    session_id=session.session_id,
                    response="I'm ready to analyze your approach! Please enter your problem statement or solution code in the **Active Context** panel on the right (or paste them directly in chat).",
                    intent=DSAIntent.GENERAL_CHAT.value,
                    structured_data=None,
                    next_actions=[
                        NextAction(label="Explain a Concept", action_prompt="What is dynamic programming and when do we use it?"),
                        NextAction(label="Common Patterns", action_prompt="What are the most common DSA patterns used in technical interviews?"),
                    ],
                    dsa_context=session.model_dump(),
                    new_session=is_new_session,
                )

        # 10. GENERAL CHAT / THEORETICAL CONCEPTS
        augmented_prompt = self._build_context_prompt(session, clean_query, recent_messages)
        try:
            config = types.GenerateContentConfig(
                system_instruction=GENERAL_CHAT_SYSTEM_PROMPT,
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
            response=self._sanitize_chat_response(chat_text),
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
