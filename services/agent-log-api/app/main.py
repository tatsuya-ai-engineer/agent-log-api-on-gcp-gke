import json
from typing import Literal, Optional

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="Agent Log API")


class AgentLogCreate(BaseModel):
    agent_id: str
    actor_user_id: Optional[str] = None
    tool_name: str
    action: str
    status: Literal["success", "failure"]


class AgentLog(AgentLogCreate):
    id: int


logs: list[AgentLog] = []


def model_to_dict(model: BaseModel) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/logs", status_code=201)
def create_log(log: AgentLogCreate) -> AgentLog:
    saved_log = AgentLog(id=len(logs) + 1, **model_to_dict(log))
    logs.append(saved_log)
    print(json.dumps(model_to_dict(saved_log), ensure_ascii=False))
    return saved_log
