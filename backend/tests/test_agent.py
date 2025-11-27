# test_agent.py
import json
from pathlib import Path
import pytest
import os

from agent import FraudAgent, FRAUD_DB

TEST_CASE = {
    "userName": "john",
    "securityIdentifier": "12345",
    "securityQuestion": "What is your favorite color?",
    "securityAnswer": "blue",
    "cardEnding": "4242",
    "transactionAmount": "₹2,499",
    "transactionName": "ABC Industry",
    "transactionTime": "2025-11-25 18:42",
    "transactionLocation": "Mumbai",
    "transactionCategory": "e-commerce",
    "transactionSource": "alibaba.com",
    "status": "pending_review",
    "outcomeNote": ""
}


def write_test_db(tmp_path: Path) -> str:
    db_path = tmp_path / "fraud_cases.json"
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump({"john": TEST_CASE}, f, indent=2)
    return str(db_path)


@pytest.mark.asyncio
async def test_full_flow(tmp_path, monkeypatch):
    db_path = write_test_db(tmp_path)
    monkeypatch.setenv("FRAUD_DB", db_path)

    agent = FraudAgent()

    # load case
    load_res = await agent.load_fraud_case(None, "john")
    assert load_res.get("found") is True
    assert agent.current_case["userName"] == "john"

    # get summary
    summary_res = await agent.get_transaction_summary(None)
    assert "ABC Industry" in summary_res["summary"]

    # correct verification
    v_ok = await agent.verify_answer(None, "blue")
    assert v_ok.get("verified") is True

    # fraud branch (user says NO)
    fraud_case = agent.build_outcome_note_and_status("fraud", "User denied transaction; mock action taken.")
    update_res = await agent.update_fraud_case(None, fraud_case)
    assert update_res.get("status") == "ok"
    with open(db_path, "r", encoding="utf-8") as f:
        db = json.load(f)
    assert db["john"]["status"] == "confirmed_fraud"

    # reset DB for safe branch test
    db_path2 = write_test_db(tmp_path)
    monkeypatch.setenv("FRAUD_DB", db_path2)
    agent2 = FraudAgent()
    await agent2.load_fraud_case(None, "john")
    v_ok2 = await agent2.verify_answer(None, "blue")
    assert v_ok2.get("verified") is True
    safe_case = agent2.build_outcome_note_and_status("safe", "User confirmed transaction.")
    update_res2 = await agent2.update_fraud_case(None, safe_case)
    assert update_res2.get("status") == "ok"
    with open(db_path2, "r", encoding="utf-8") as f:
        db2 = json.load(f)
    assert db2["john"]["status"] == "confirmed_safe"

    # verification failure
    db_path3 = write_test_db(tmp_path)
    monkeypatch.setenv("FRAUD_DB", db_path3)
    agent3 = FraudAgent()
    await agent3.load_fraud_case(None, "john")
    v_fail = await agent3.verify_answer(None, "red")
    assert v_fail.get("verified") is False
    fail_case = agent3.build_outcome_note_and_status("verification_failed", "Failed verification.")
    await agent3.update_fraud_case(None, fail_case)
    with open(db_path3, "r", encoding="utf-8") as f:
        db3 = json.load(f)
    assert db3["john"]["status"] == "verification_failed"
