# Saúde++ API

Saúde++ é um projeto de integração entre sistemas públicos e privados de saúde, permitindo a leitura e análise de prontuários médicos com suporte de Inteligência Artificial. O sistema utiliza **FastAPI** para criar endpoints que recebem prompts, processam informações via IA e retornam **JSON estruturado**, que pode ser armazenado em um banco de dados.

---

## Funcionalidades

- Recebe dados de prontuários médicos ou prompts do usuário.
- Envia para uma API de IA especializada em interpretação médica.
- Retorna informações estruturadas em **JSON**:
  - Nome, idade, sexo
  - Diagnóstico, conduta, observações de qualidade
  - Especialidade, dados originais do prontuário
  - Relatório médico resumido
  - Interpretação da IA
  - Referências e justificativas
- Salva automaticamente os dados no banco de dados (SQLite ou PostgreSQL).
- Permite consulta de prontuários já processados via endpoint.
