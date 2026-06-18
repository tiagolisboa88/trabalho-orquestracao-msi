from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent


@CrewBase
class TrabalhoOrquestracao():
    """MSI Engenharia - Sistema Multiagente de Orçamentação Técnica"""

    agents: list[BaseAgent]
    tasks: list[Task]

    @agent
    def leitor_tecnico(self) -> Agent:
        return Agent(
            config=self.agents_config['leitor_tecnico'],
            verbose=True,
            allow_delegation=False
        )

    @agent
    def compositor(self) -> Agent:
        return Agent(
            config=self.agents_config['compositor'],
            verbose=True,
            allow_delegation=False
        )

    @agent
    def orcamentista(self) -> Agent:
        return Agent(
            config=self.agents_config['orcamentista'],
            verbose=True,
            allow_delegation=False
        )

    @agent
    def revisor_proposta(self) -> Agent:
        return Agent(
            config=self.agents_config['revisor_proposta'],
            verbose=True,
            allow_delegation=False
        )

    @task
    def leitura_tecnica(self) -> Task:
        return Task(
            config=self.tasks_config['leitura_tecnica'],
        )

    @task
    def composicao_hh(self) -> Task:
        return Task(
            config=self.tasks_config['composicao_hh'],
        )

    @task
    def consolidacao_orcamento(self) -> Task:
        return Task(
            config=self.tasks_config['consolidacao_orcamento'],
        )

    @task
    def revisao_proposta(self) -> Task:
        return Task(
            config=self.tasks_config['revisao_proposta'],
            output_file='proposta_final.md'
        )

    @crew
    def crew(self) -> Crew:
        """Crew de Orçamentação MSI - Fluxo Sequencial com Human-in-the-Loop"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
            memory=False,
        )
