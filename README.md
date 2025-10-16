# Sistema Sentinela RDW - Vigilância Nutricional em Saúde Pública

## 📋 Descrição

O **Sentinela RDW** é um sistema de vigilância em saúde pública que analisa dados de hemogramas para identificar precocemente grupos populacionais (bairros) em risco nutricional, utilizando o parâmetro RDW (Red Cell Distribution Width) como indicador principal.

## 🎯 Objetivo

Detectar áreas geográficas com possíveis problemas nutricionais através da análise agregada de dados de RDW, permitindo intervenções preventivas direcionadas.

## 📊 Critérios de Alerta

Uma área é classificada como **"ÁREA DE ALERTA NUTRICIONAL"** quando atende AMBOS os critérios:

- **RDW Médio** > 14.0%
- **Porcentagem de exames com RDW > 14.5%** > 25.0%

## 🔧 Requisitos

- Python 3.10+
- Pandas
- Arquivos JSON com dados de hemogramas

## 📁 Estrutura de Dados

Cada arquivo JSON deve seguir esta estrutura:

```json
{
  "id_paciente": "PID-987654",
  "data_coleta": "2025-09-25",
  "dados_demograficos": {
    "idade": 35,
    "sexo": "F",
    "localidade": {
      "bairro": "Jardim América",
      "cidade": "Goiânia"
    }
  },
  "resultados_hemograma": {
    "hemoglobina_g_dl": 12.8,
    "hematocrito_percent": 38.5,
    "vcm_fl": 85.0,
    "rdw_cv_percent": 15.2
  }
}
```

## 🚀 Como Usar

1. **Preparar os dados**: Coloque os arquivos JSON na pasta `./dados/`

2. **Executar o sistema**:
   ```bash
   python sentinela_rdw.py
   ```

3. **Interpretar os resultados**: O sistema gerará um relatório detalhado no console

## 📈 Exemplo de Saída

```
🏥 Sistema Sentinela RDW - Vigilância Nutricional
============================================================
RELATÓRIO DE VIGILÂNCIA NUTRICIONAL - SENTINELA RDW
============================================================

🚨 ÁREAS DE ALERTA NUTRICIONAL IDENTIFICADAS 🚨

[ALERTA] Bairro: Parque Amazônia
  Exames Processados: 2
  RDW Médio: 16.65%
  Exames com RDW > 14.5%: 100.00%

--- ANÁLISE GERAL DOS BAIRROS ---

Bairro: Jardim América
  Exames Processados: 2
  RDW Médio: 12.85%
  Exames com RDW > 14.5%: 0.00%

============================================================
```

## 🔍 Funcionalidades

- ✅ Leitura automática de múltiplos arquivos JSON
- ✅ Validação de dados de entrada
- ✅ Análise agregada por bairro
- ✅ Identificação automática de áreas de risco
- ✅ Relatório formatado e detalhado
- ✅ Tratamento de erros e dados inválidos

## 📝 Logs e Validação

O sistema fornece feedback detalhado sobre:
- Arquivos processados com sucesso
- Arquivos com dados inválidos
- Estatísticas gerais da análise
- Áreas identificadas como de risco

## 🏥 Aplicação em Saúde Pública

Este sistema pode ser integrado a:
- Sistemas de informação hospitalar
- Programas de vigilância nutricional
- Políticas públicas de saúde preventiva
- Monitoramento epidemiológico regional

## 📞 Suporte

Para dúvidas sobre a implementação ou interpretação dos resultados, consulte a documentação técnica ou entre em contato com a equipe de vigilância em saúde.
