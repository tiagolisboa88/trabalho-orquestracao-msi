"""Listener de progresso para o crew MSI.

Captura eventos de início/fim de tasks e do crew completo, mantendo
em memória o estado de cada execução para consumo via API REST.
"""

from __future__ import annotations

import threading
import time
from typing import Any, Dict, List, Optional

from crewai.events.base_event_listener import BaseEventListener
from crewai.events.types.crew_events import (
    CrewKickoffCompletedEvent,
    CrewKickoffFailedEvent,
    CrewKickoffStartedEvent,
)
from crewai.events.types.task_events import (
    TaskCompletedEvent,
    TaskFailedEvent,
    TaskStartedEvent,
)


TASK_NAMES: List[str] = [
    "leitura_tecnica",
    "composicao_hh",
    "consolidacao_orcamento",
    "revisao_proposta",
]

TASK_LABELS: Dict[str, str] = {
    "leitura_tecnica": "Leitor Técnico",
    "composicao_hh": "Compositor HH",
    "consolidacao_orcamento": "Orçamentista",
    "revisao_proposta": "Revisor Técnico",
}


_LOCK = threading.Lock()
EXECUTIONS: Dict[str, Dict[str, Any]] = {}


def init_execution(execution_id: str, projeto: str) -> Dict[str, Any]:
    state: Dict[str, Any] = {
        "execution_id": execution_id,
        "projeto": projeto,
        "state": "pending",
        "current_task": None,
        "tasks": [
            {"name": name, "label": TASK_LABELS[name], "status": "pending", "output": None}
            for name in TASK_NAMES
        ],
        "error": None,
        "raw": None,
        "started_at": time.time(),
        "finished_at": None,
    }
    with _LOCK:
        EXECUTIONS[execution_id] = state
    return state


def get_execution(execution_id: str) -> Optional[Dict[str, Any]]:
    with _LOCK:
        state = EXECUTIONS.get(execution_id)
        if not state:
            return None
        return {
            **state,
            "tasks": [dict(t) for t in state["tasks"]],
        }


def _resolve_task_name(event: Any, source: Any = None) -> Optional[str]:
    """Identifica qual das 4 tasks o evento representa.

    Os eventos do CrewAI carregam `task_name` quando emitidos durante a
    execução de uma task, mas também precisamos lidar com fallback via
    `description`.
    """
    candidates: List[str] = []
    for obj in (event, source):
        if obj is None:
            continue
        for attr in ("task_name", "name"):
            value = getattr(obj, attr, None)
            if value:
                candidates.append(str(value))
    description = ""
    for obj in (event, source):
        if obj is None:
            continue
        task_obj = getattr(obj, "task", None)
        if task_obj is not None:
            description += " " + str(getattr(task_obj, "description", "") or "")
        description += " " + str(getattr(obj, "description", "") or "")
    haystack = (" ".join(candidates) + " " + description).lower()
    for name in TASK_NAMES:
        if name in haystack:
            return name
    return None


def _update_task(execution_id: str, task_name: str, **changes: Any) -> None:
    with _LOCK:
        state = EXECUTIONS.get(execution_id)
        if not state:
            return
        for task in state["tasks"]:
            if task["name"] == task_name:
                task.update(changes)
                break


def _set_state(execution_id: str, **changes: Any) -> None:
    with _LOCK:
        state = EXECUTIONS.get(execution_id)
        if not state:
            return
        state.update(changes)


def _extract_raw(output: Any) -> Optional[str]:
    if output is None:
        return None
    raw = getattr(output, "raw", None)
    if raw:
        return str(raw)
    try:
        return str(output)
    except Exception:
        return None


class ProgressListener(BaseEventListener):
    """Listener que mantém o estado da execução em `EXECUTIONS`."""

    def __init__(self, execution_id: str) -> None:
        super().__init__()
        self.execution_id = execution_id

    def setup_listeners(self, crewai_event_bus) -> None:  # noqa: D401
        eid = self.execution_id

        @crewai_event_bus.on(CrewKickoffStartedEvent)
        def _on_kickoff_started(source, event):  # noqa: ANN001
            _set_state(eid, state="running", current_task=None)

        @crewai_event_bus.on(TaskStartedEvent)
        def _on_task_started(source, event):  # noqa: ANN001
            task_name = _resolve_task_name(event, source)
            if not task_name:
                return
            _set_state(eid, current_task=task_name)
            _update_task(eid, task_name, status="running")

        @crewai_event_bus.on(TaskCompletedEvent)
        def _on_task_completed(source, event):  # noqa: ANN001
            task_name = _resolve_task_name(event, source)
            if not task_name:
                return
            raw = _extract_raw(getattr(event, "output", None))
            _update_task(eid, task_name, status="completed", output=raw)

        @crewai_event_bus.on(TaskFailedEvent)
        def _on_task_failed(source, event):  # noqa: ANN001
            task_name = _resolve_task_name(event, source)
            if not task_name:
                return
            err = getattr(event, "error", None) or "Falha na execução da task"
            _update_task(eid, task_name, status="failed", output=str(err))

        @crewai_event_bus.on(CrewKickoffCompletedEvent)
        def _on_kickoff_completed(source, event):  # noqa: ANN001
            raw = _extract_raw(getattr(event, "output", None))
            _set_state(
                eid,
                state="completed",
                current_task=None,
                raw=raw,
                finished_at=time.time(),
            )

        @crewai_event_bus.on(CrewKickoffFailedEvent)
        def _on_kickoff_failed(source, event):  # noqa: ANN001
            err = getattr(event, "error", None) or "Falha no kickoff do crew"
            _set_state(
                eid,
                state="failed",
                error=str(err),
                finished_at=time.time(),
            )
