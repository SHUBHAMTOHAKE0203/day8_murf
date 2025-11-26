import os
import json
import asyncio
import pytest
from pathlib import Path

from livekit.agents import AgentSession, inference, llm


from agent import Assistant, load_faq, LEADS_FILE, FAQ_FILE

TEST_FAQ = {
    "company": "Pesto Labs",
    "product_overview": "Pesto Labs helps engineers level up with interview prep and curated learning paths.",
    "pricing": "There is a free tier with limited content. Paid plans start at ₹499/month.",
    "faq": [
        {"q": "What does the product do?", "a": "We provide interview prep and structured learning for software engineers."},
        {"q": "Do you offer free tier?", "a": "Yes. We offer a free tier with limited access."},
        {"q": "Who is this for?", "a": "Early-career and mid-career software engineers preparing for interviews."},
    ],
}

# small helper to write test faq
def write_test_faq(tmp_path: Path):
    faq_path = tmp_path / "company_faq.json"
    with faq_path.open("w", encoding="utf-8") as f:
        json.dump(TEST_FAQ, f, indent=2)
    return str(faq_path)

# LLM test harness (same pattern as examples)
def _llm() -> llm.LLM:
    return inference.LLM(model="openai/gpt-4.1-mini")  # change if needed

@pytest.mark.asyncio
async def test_sdr_flow(tmp_path: Path, monkeypatch):
    """
    Simulate a user: greeting -> ask 'what do you do?' -> provide name/company/email -> thanks
    Expect the agent to use the FAQ for answer and to save a lead record at the end.
    """
    # prepare test FAQ and leads path
    faq_path = write_test_faq(tmp_path)
    leads_path = tmp_path / "leads.json"

    # point agent module to test files
    monkeypatch.setenv("FAQ_FILE", faq_path)
    monkeypatch.setenv("LEADS_FILE", str(leads_path))

    # reload module objects if necessary by reloading agent (optional)
    # import importlib, agent
    # importlib.reload(agent)

    # Instantiate assistant directly with loaded faq for local testing
    faq_data = load_faq(faq_path)
    assistant = Assistant(faq=faq_data)

    # Instead of running the full AgentSession (which requires plugin setup), we can directly test:
    # 1) find_faq tool
    result = await assistant.find_faq(None, "What does the product do?")
    assert result.get("found") is True
    assert "interview prep" in result.get("answer").lower()

    # 2) Simulate filling lead buffer and saving
    lead = {
        "name": "Test User",
        "company": "ExampleCo",
        "email": "test@example.com",
        "role": "CTO",
        "use_case": "Interview prep for team",
        "team_size": "10",
        "timeline": "soon",
    }
    save_res = await assistant.save_lead(None, lead)
    assert save_res.get("status") == "ok"

    # file should exist with the saved lead
    assert leads_path.exists()
    with open(leads_path, "r", encoding="utf-8") as f:
        leads = json.load(f)
    assert isinstance(leads, list)
    assert any(l.get("email") == "test@example.com" for l in leads)

    # 3) Basic behavior: assistant instructions contain 'SDR' hints and lead fields
    assert "lead fields" in assistant.instructions.lower() or "collect these lead fields" in assistant.instructions.lower()
