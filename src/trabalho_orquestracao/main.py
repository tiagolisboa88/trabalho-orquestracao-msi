#!/usr/bin/env python
import sys
import warnings

from datetime import datetime

from trabalho_orquestracao.crew import TrabalhoOrquestracao

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")


def run():
    inputs = {
        'projeto': 'Montagem de Estruturas Metálicas - Planta de Beneficiamento',
        'documentos': 'Memorial descritivo, desenhos estruturais e lista de materiais',
        'base_historica': 'base_historica_obras.xlsx',
        'current_year': str(datetime.now().year)
    }

    try:
        TrabalhoOrquestracao().crew().kickoff(inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


def train():
    inputs = {
        'projeto': 'Montagem de Estruturas Metálicas - Planta de Beneficiamento',
        'documentos': 'Memorial descritivo, desenhos estruturais e lista de materiais',
        'base_historica': 'base_historica_obras.xlsx',
        'current_year': str(datetime.now().year)
    }
    try:
        TrabalhoOrquestracao().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")


def replay():
    try:
        TrabalhoOrquestracao().crew().replay(task_id=sys.argv[1])
    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")


def test():
    inputs = {
        'projeto': 'Montagem de Estruturas Metálicas - Planta de Beneficiamento',
        'documentos': 'Memorial descritivo, desenhos estruturais e lista de materiais',
        'base_historica': 'base_historica_obras.xlsx',
        'current_year': str(datetime.now().year)
    }
    try:
        TrabalhoOrquestracao().crew().test(n_iterations=int(sys.argv[1]), eval_llm=sys.argv[2], inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")


def run_with_trigger():
    import json

    if len(sys.argv) < 2:
        raise Exception("No trigger payload provided. Please provide JSON payload as argument.")

    try:
        trigger_payload = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        raise Exception("Invalid JSON payload provided as argument")

    inputs = {
        "crewai_trigger_payload": trigger_payload,
        "projeto": "",
        "documentos": "",
        "base_historica": "base_historica_obras.xlsx",
        "current_year": str(datetime.now().year)
    }

    try:
        result = TrabalhoOrquestracao().crew().kickoff(inputs=inputs)
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew with trigger: {e}")
