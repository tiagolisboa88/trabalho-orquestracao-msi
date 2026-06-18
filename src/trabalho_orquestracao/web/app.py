import os
import httpx
import pdfplumber
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI(title="MSI Engenharia - Orçamentação Inteligente")

CREWAI_URL = os.getenv(
    "CREWAI_API_URL",
    "https://trabalho-orquestracao-b9058fa5-081b-43c5-b3-f282ed4c.crewai.com"
)
CREWAI_TOKEN = os.getenv("CREWAI_TOKEN", "de008b5e5658")

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


def extract_pdf_text(file_bytes: bytes) -> str:
    import io
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = STATIC_DIR / "index.html"
    return HTMLResponse(content=html_path.read_text(encoding="utf-8"))


@app.post("/api/kickoff")
async def kickoff(
    projeto: str = Form(...),
    base_historica: str = Form("base_historica_obras.xlsx"),
    escopo_pdf: UploadFile = File(...),
):
    pdf_bytes = await escopo_pdf.read()
    pdf_text = extract_pdf_text(pdf_bytes)

    if not pdf_text.strip():
        return JSONResponse(
            status_code=400,
            content={"error": "Não foi possível extrair texto do PDF. Verifique se o arquivo não é uma imagem escaneada."}
        )

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{CREWAI_URL}/kickoff",
            headers={
                "Authorization": f"Bearer {CREWAI_TOKEN}",
                "Content-Type": "application/json",
            },
            json={
                "inputs": {
                    "projeto": projeto,
                    "escopo_pdf": pdf_text,
                    "base_historica": base_historica,
                }
            },
        )
    return response.json()


@app.get("/api/status/{kickoff_id}")
async def status(kickoff_id: str):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            f"{CREWAI_URL}/status/{kickoff_id}",
            headers={
                "Authorization": f"Bearer {CREWAI_TOKEN}",
                "Content-Type": "application/json",
            },
        )
    return response.json()
