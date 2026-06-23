"""FastAPI local para a plataforma MSI SmartBid AI.

Executa o crew CrewAI em background na própria máquina do usuário e expõe
endpoints REST consumidos pelo frontend Next.js.
"""

from __future__ import annotations

import asyncio
import io
import os
import threading
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

import pdfplumber
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

from trabalho_orquestracao.crew import TrabalhoOrquestracao
from trabalho_orquestracao.progress import (
    EXECUTIONS,
    ProgressListener,
    get_execution,
    init_execution,
)


PROJECT_ROOT = Path(__file__).resolve().parents[3]
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(title="MSI Engenharia - SmartBid AI (Local)")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract_pdf_text(file_bytes: bytes) -> str:
    parts: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                parts.append(text)
    return "\n\n".join(parts)


def _run_crew_sync(
    execution_id: str,
    projeto: str,
    escopo_texto: str,
    base_historica: str,
) -> None:
    """Executa o crew de forma síncrona (rodada dentro de uma thread)."""
    output_path = OUTPUTS_DIR / f"{execution_id}.md"
    listener = ProgressListener(execution_id)
    try:
        crew_wrapper = TrabalhoOrquestracao().set_output_file(str(output_path))
        crew_wrapper.crew().kickoff(
            inputs={
                "projeto": projeto,
                "escopo_pdf": escopo_texto,
                "base_historica": base_historica,
                "current_year": str(datetime.now().year),
            }
        )
    except Exception as exc:
        state = EXECUTIONS.get(execution_id)
        if state is not None:
            state["state"] = "failed"
            state["error"] = str(exc)
        else:
            init_execution(execution_id, projeto)
            EXECUTIONS[execution_id]["state"] = "failed"
            EXECUTIONS[execution_id]["error"] = str(exc)
    finally:
        # Mantém a referência viva para o GC não coletar o listener
        # enquanto o crew ainda emite eventos.
        del listener


@app.get("/api/health")
async def health() -> JSONResponse:
    has_key = bool(os.getenv("OPENAI_API_KEY"))
    return JSONResponse({
        "ok": True,
        "has_api_key": has_key,
        "outputs_dir": str(OUTPUTS_DIR),
        "model": os.getenv("MODEL", "gpt-4o"),
    })


@app.post("/api/kickoff")
async def kickoff(
    background_tasks: BackgroundTasks,
    projeto: str = Form(...),
    base_historica: str = Form("base_historica_obras.xlsx"),
    escopo_texto: Optional[str] = Form(None),
    escopo_pdf: Optional[UploadFile] = File(None),
) -> JSONResponse:
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=400,
            detail="OPENAI_API_KEY não configurada. Defina a variável em .env e reinicie o servidor.",
        )

    texto_consolidado_parts: list[str] = []
    if escopo_texto and escopo_texto.strip():
        texto_consolidado_parts.append(escopo_texto.strip())

    if escopo_pdf is not None:
        pdf_bytes = await escopo_pdf.read()
        if pdf_bytes:
            pdf_text = _extract_pdf_text(pdf_bytes)
            if pdf_text.strip():
                texto_consolidado_parts.append(pdf_text.strip())

    if not texto_consolidado_parts:
        raise HTTPException(
            status_code=400,
            detail="É necessário fornecer escopo_texto ou um escopo_pdf válido.",
        )

    escopo_consolidado = "\n\n".join(texto_consolidado_parts)

    execution_id = uuid.uuid4().hex
    init_execution(execution_id, projeto)

    def _runner() -> None:
        thread = threading.Thread(
            target=_run_crew_sync,
            args=(execution_id, projeto, escopo_consolidado, base_historica),
            daemon=True,
        )
        thread.start()

    background_tasks.add_task(_runner)

    return JSONResponse({"execution_id": execution_id, "state": "pending"})


@app.get("/api/progress/{execution_id}")
async def progress(execution_id: str) -> JSONResponse:
    state = get_execution(execution_id)
    if state is None:
        raise HTTPException(status_code=404, detail="execution_id desconhecido")
    return JSONResponse(state)


@app.get("/api/proposals/{execution_id}/final")
async def final_proposal(execution_id: str) -> PlainTextResponse:
    path = OUTPUTS_DIR / f"{execution_id}.md"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Proposta final ainda não gerada")
    return PlainTextResponse(path.read_text(encoding="utf-8"))


@app.get("/")
async def root() -> JSONResponse:
    return JSONResponse({
        "service": "MSI SmartBid AI",
        "frontend": "http://localhost:3000",
        "endpoints": [
            "GET /api/health",
            "POST /api/kickoff",
            "GET /api/progress/{execution_id}",
            "GET /api/proposals/{execution_id}/final",
        ],
    })
