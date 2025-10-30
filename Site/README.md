# Sistema de Vigilância de Saúde Pública - RDW Goiás

Um sistema completo de monitoramento epidemiológico do RDW (Red Cell Distribution Width) para a população do estado de Goiás, Brasil. O sistema oferece visualizações interativas, mapas de calor e análises estatísticas em tempo real.

## 🏥 Funcionalidades Principais

### 📊 **Visualizações Interativas**
- **Mapas de Calor**: Mapa interativo do estado de Goiás com visualização por municípios
- **Gráficos Dinâmicos**: Comparação entre cidades, evolução temporal, distribuições demográficas
- **Dashboard Personalizável**: Widgets rearranjáveis com diferentes métricas
- **Análise Estatística**: Cálculos epidemiológicos em tempo real

### 🗺️ **Sistema de Mapas**
- Mapa interativo do estado de Goiás
- Heatmaps por município com cores indicativas de risco:
  - 🟢 **Verde**: RDW Normal (11.5% - 14.5%)
  - 🟡 **Amarelo**: RDW Elevado (14.5% - 16%)
  - 🔴 **Vermelho**: RDW Muito Elevado (>16%)
- Pop-ups detalhados ao clicar nos municípios
- Filtros por região e período

### 📈 **Gráficos e Análises**
1. **Comparação entre Cidades**: Gráficos de barras comparando RDW médio
2. **Evolução Temporal**: Linhas temporais mostrando tendências por bairro/cidade
3. **Análise Demográfica**: Boxplots por idade e sexo
4. **Distribuição de RDW**: Histogramas de frequência
5. **Resumo por Município**: Tabelas interativas com estatísticas

## 📋 **Estrutura de Dados**

O sistema aceita arquivos JSON com a seguinte estrutura:

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

## 🚀 **Como Usar**

### **1. Upload de Dados**
- Clique no botão "📊 Upload de Dados"
- Selecione um arquivo JSON com a estrutura especificada
- Os dados serão processados automaticamente

### **2. Dados de Exemplo**
- Use o botão "📋 Dados de Exemplo" para carregar dados demonstrativos
- Sistema gera 5.000 pacientes com dados realistas

### **3. Navegação**
- **Mapa**: Clique nas áreas para ver detalhes específicos
- **Gráficos**: Use os controles para alterar tipos de visualização
- **Tabela**: Clique nas linhas para abrir detalhes do município

### **4. Exportação**
- **Exportar Dados**: Baixe todos os dados processados em JSON
- **Exportar Mapa**: Salve configurações do mapa
- **Relatórios**: Gere relatórios automáticos

## 🎯 **Recursos Técnicos**

### **Interface Responsiva**
- Design adaptativo para desktop, tablet e mobile
- Glassmorphism UI para melhor experiência visual
- Animações suaves e feedback visual

### **Performance**
- Processamento otimizado para milhares de registros
- Carregamento progressivo de dados
- Cache inteligente para visualizações

### **Acessibilidade**
- Navegação por teclado
- Alto contraste nas cores
- Tooltips informativos
- Feedback para leitores de tela

## 📊 **Referências Epidemiológicas**

### **Valores de Referência RDW**
- **Normal**: 11.5% - 14.5%
- **Elevado**: 14.5% - 16.0%
- **Muito Elevado**: >16.0%

### **População de Goiás (2025)**
- **Total**: ~7.42 milhões de habitantes
- **Capital**: Goiânia (~1.5 milhões)
- **Principais cidades**: Anápolis, Aparecida de Goiânia, Rio Verde

## 🛠️ **Tecnologias Utilizadas**

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Mapas**: Leaflet.js
- **Gráficos**: Chart.js
- **UI**: Design System personalizado
- **Dados**: Processamento JSON em tempo real

## 📁 **Estrutura do Projeto**

```
├── index.html              # Página principal
├── styles/
│   └── main.css           # Estilos principais
├── scripts/
│   ├── data-processor.js   # Processamento de dados
│   ├── map-manager.js     # Gerenciamento de mapas
│   ├── chart-manager.js   # Gerenciamento de gráficos
│   ├── ui-manager.js      # Interface do usuário
│   └── main.js            # Aplicação principal
└── README.md              # Documentação
```

## 🔬 **Análises Disponíveis**

### **1. Estatísticas Gerais**
- Total de pacientes analisados
- RDW médio da população
- Percentual de casos elevados
- Cidades monitoradas

### **2. Análise Geográfica**
- Distribuição por municípios
- Mapas de calor com indicadores de risco
- Comparação entre regiões

### **3. Análise Temporal**
- Evolução do RDW ao longo do tempo
- Tendências sazonais
- Identificação de surtos

### **4. Análise Demográfica**
- Distribuição por idade
- Diferenças entre sexos
- Correlações epidemiológicas

## 📈 **Casos de Uso**

### **Autoridades de Saúde**
- Monitoramento populacional em tempo real
- Identificação de áreas de risco
- Planejamento de intervenções

### **Profissionais de Saúde**
- Análise de tendências locais
- Comparação entre regiões
- Suporte a decisões clínicas

### **Pesquisadores**
- Análise de grandes conjuntos de dados
- Estudos epidemiológicos
- Publicação de relatórios

## 🔒 **Privacidade e Segurança**

- Dados processados localmente no navegador
- Nenhuma informação enviada para servidores externos
- Conformidade com LGPD (Lei Geral de Proteção de Dados)
- Opção de anonimização de dados

## 🤝 **Contribuições**

Este sistema foi desenvolvido para apoiar a vigilância epidemiológica em Goiás. Sugestões e melhorias são bem-vindas.

## 📞 **Suporte**

Para dúvidas técnicas ou sugestões:
- Documentação completa incluída
- Exemplos de dados disponíveis
- Interface intuitiva e autoexplicativa

---

**Desenvolvido para apoiar a saúde pública do estado de Goiás** 🇧🇷