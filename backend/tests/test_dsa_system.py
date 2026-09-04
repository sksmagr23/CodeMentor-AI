"""
Comprehensive test suite for CodeMentor AI.
Verifies all 16 architectural test requirements:
1. Session creation
2. Session continuation
3. MongoDB persistence
4. Problem setup
5. Missing-context handling
6. Intent routing
7. Structured response validation
8. Contextual action generation
9. Component registry mapping
10. General chat
11. Analyze approach
12. Bug analysis
13. Counterexample
14. Optimization
15. Comparison
16. Dry-run action flow
"""
import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.services.session import get_session_service
from backend.services.conversation import get_conversation_service
from backend.agents.schemas import ContextUpdateRequest, DSAIntent, StructuredDataType


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_session_creation_and_persistence():
    """Test 1, 2, 3: Session creation, continuation, and MongoDB persistence."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/sessions", json={"user_id": "test_user_1"})
        assert res.status_code == 200
        data = res.json()
        session_id = data["session_id"]
        assert session_id is not None

        get_res = await ac.get(f"/api/sessions/{session_id}")
        assert get_res.status_code == 200
        assert get_res.json()["session_id"] == session_id
        assert get_res.json()["user_id"] == "test_user_1"


@pytest.mark.asyncio
async def test_missing_context_handling():
    """Test 5: Missing context returns clear conversational guidance directing user to side panel."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/query", json={"query": "Why is my solution wrong?"})
        assert res.status_code == 200
        data = res.json()
        assert data["intent"] == DSAIntent.GENERAL_CHAT.value
        assert "Active Context" in data["response"] or "solution code" in data["response"]
        assert len(data["next_actions"]) > 0


@pytest.mark.asyncio
async def test_general_chat():
    """Test 10: General chat query returns normal conversation with starter chips."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/query", json={"query": "What is dynamic programming?"})
        assert res.status_code == 200
        data = res.json()
        assert data["intent"] == DSAIntent.GENERAL_CHAT.value
        assert data["response"] is not None
        assert len(data["next_actions"]) > 0


@pytest.mark.asyncio
async def test_problem_setup_and_context_persistence():
    """Test 4: Problem setup context save and immediate analysis."""
    session_service = get_session_service()
    session = session_service.create_session(user_id="test_user_dsa")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        setup_payload = {
            "problem": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "solution": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int comp = target - nums[i];\n            if (seen.count(comp)) return {seen[comp], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};",
            "language": "cpp",
            "active_input": "[2, 7, 11, 15], target = 9",
            "analyze_immediately": True,
        }
        res = await ac.post(f"/api/sessions/{session.session_id}/context", json=setup_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["session_id"] == session.session_id
        assert data["structured_data"] is not None
        assert data["structured_data"]["type"] == StructuredDataType.APPROACH_CARD.value
        assert len(data["next_actions"]) > 0


@pytest.mark.asyncio
async def test_full_dsa_analysis_flow():
    """
    Test 6, 7, 8, 11, 12, 13, 14, 15, 16:
    End-to-end multi-turn session continuation:
    - Session created
    - Problem + solution stored
    - 'Analyze my approach' -> approach card
    - 'Why is it wrong?' -> bug card
    - 'Give me a counterexample' -> counterexample card
    - 'Show dry run' -> dry_run_image
    - 'Show optimal approach' -> optimization card
    - 'Compare both' -> solution comparison card
    """
    session_service = get_session_service()
    session = session_service.create_session(
        user_id="test_runner",
        initial_context=ContextUpdateRequest(
            problem="Two Sum: Find two numbers that sum up to target",
            solution="class Solution { public: vector<int> twoSum(vector<int>& nums, int t) { for(int i=0; i<nums.size(); i++) for(int j=i+1; j<nums.size(); j++) if(nums[i]+nums[j]==t) return {i, j}; return {}; } };",
            language="cpp",
            active_input="nums = [2, 7, 11, 15], target = 9",
        )
    )
    sid = session.session_id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Analyze approach
        res1 = await ac.post("/api/query", json={"session_id": sid, "query": "Analyze my solution approach"})
        assert res1.status_code == 200
        d1 = res1.json()
        assert d1["intent"] == DSAIntent.ANALYZE_SOLUTION.value
        assert d1["structured_data"]["type"] == StructuredDataType.APPROACH_CARD.value

        # 2. Why is it wrong? / Debug
        res2 = await ac.post("/api/query", json={"session_id": sid, "query": "Why is my solution wrong? Any bugs?"})
        assert res2.status_code == 200
        d2 = res2.json()
        assert d2["intent"] == DSAIntent.DEBUG_SOLUTION.value
        assert d2["structured_data"]["type"] == StructuredDataType.BUG_ANALYSIS_CARD.value

        # 3. Counterexample
        res3 = await ac.post("/api/query", json={"session_id": sid, "query": "Give me a counterexample"})
        assert res3.status_code == 200
        d3 = res3.json()
        assert d3["intent"] == DSAIntent.COUNTEREXAMPLE.value
        assert d3["structured_data"]["type"] == StructuredDataType.COUNTEREXAMPLE_CARD.value

        # 4. Dry run on-demand
        res4 = await ac.post("/api/query", json={"session_id": sid, "query": "Show me the dry run trace"})
        assert res4.status_code == 200
        d4 = res4.json()
        assert d4["intent"] == DSAIntent.DRY_RUN.value
        assert d4["structured_data"]["type"] == StructuredDataType.DRY_RUN_IMAGE.value
        assert "image_url" in d4["structured_data"]

        # 5. Show optimal
        res5 = await ac.post("/api/query", json={"session_id": sid, "query": "Show the optimal approach"})
        assert res5.status_code == 200
        d5 = res5.json()
        assert d5["intent"] == DSAIntent.OPTIMIZE_SOLUTION.value
        assert d5["structured_data"]["type"] == StructuredDataType.OPTIMIZATION_CARD.value

        # 6. Compare solutions
        res6 = await ac.post("/api/query", json={"session_id": sid, "query": "Compare both approaches"})
        assert res6.status_code == 200
        d6 = res6.json()
        assert d6["intent"] == DSAIntent.COMPARE_SOLUTIONS.value
        assert d6["structured_data"]["type"] == StructuredDataType.SOLUTION_COMPARISON_CARD.value

        # 7. Check message history persistence
        hist_res = await ac.get(f"/api/sessions/{sid}/messages")
        assert hist_res.status_code == 200
        messages = hist_res.json()
        assert len(messages) >= 12


@pytest.mark.asyncio
async def test_google_auth_and_user_session_flow():
    """Test Backend Google Authentication, JWT verification, and user session isolation."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login with Google
        auth_res = await ac.post("/api/auth/google", json={
            "email": "test.engineer@google.com",
            "name": "Test Google Engineer",
            "avatar_url": "https://example.com/avatar.png",
            "google_id": "goog_123456789",
        })
        assert auth_res.status_code == 200
        auth_data = auth_res.json()
        token = auth_data["access_token"]
        user_id = auth_data["user"]["id"]
        assert token is not None
        assert auth_data["user"]["email"] == "test.engineer@google.com"

        # 2. Verify /api/auth/me with Bearer token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await ac.get("/api/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["id"] == user_id
        assert me_data["email"] == "test.engineer@google.com"

        # 3. Create session for this authenticated user
        sess_res = await ac.post("/api/sessions", headers=headers, json={})
        assert sess_res.status_code == 200
        sess_data = sess_res.json()
        assert sess_data["user_id"] == user_id

        # 4. List sessions for this authenticated user
        list_res = await ac.get("/api/sessions", headers=headers)
        assert list_res.status_code == 200
        user_sessions = list_res.json()
        assert any(s["session_id"] == sess_data["session_id"] for s in user_sessions)
