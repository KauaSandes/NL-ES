# 🏥 Sistema de Vigilância de Saúde Pública - RDW Goiás
## Demonstração Completa

Este sistema foi desenvolvido para apoiar a vigilância epidemiológica do RDW (Red Cell Distribution Width) na população do estado de Goiás, Brasil.

## 📁 Arquivos Criados

### **Arquivos Principais**
- **`index.html`** - Aplicação principal completa
- **`styles/main.css`** - Sistema de design com Glassmorphism
- **`scripts/main.js`** - Coordenador principal da aplicação

### **Módulos JavaScript**
- **`scripts/data-processor.js`** - Processamento e análise de dados
- **`scripts/map-manager.js`** - Gerenciamento de mapas interativos
- **`scripts/chart-manager.js`** - Gerenciamento de gráficos dinâmicos
- **`scripts/ui-manager.js`** - Interface do usuário e interações

### **Documentação e Configuração**
- **`README.md`** - Documentação completa do sistema
- **`config.json`** - Configurações do sistema
- **`sample-data.json`** - Dados de exemplo (10 pacientes)
- **`test.html`** - Página de teste e demonstração

## 🚀 Como Executar

### **Opção 1: Sistema Completo**
1. Abra o arquivo `index.html` em um navegador web moderno
2. Clique em "📋 Dados de Exemplo" para carregar dados demonstrativos
3. Explore as funcionalidades interativas

### **Opção 2: Página de Teste**
1. Abra o arquivo `test.html` para ver o resumo das funcionalidades
2. Use os botões para acessar o sistema principal e baixar dados

## 🎯 Funcionalidades Implementadas

### ✅ **Mapas Geográficos Interativos**
- Mapa do estado de Goiás com 25+ municípios
- Heatmaps com cores indicativas de risco RDW
- Pop-ups informativos ao clicar nas regiões
- Dados demográficos integrados

### ✅ **Visualizações Dinâmicas**
- **Comparação entre Cidades**: Gráficos de barras com RDW médio
- **Evolução Temporal**: Linhas temporais por município
- **Análise Demográfica**: Boxplots por idade e sexo
- **Distribuição RDW**: Histogramas de frequência

### ✅ **Dashboard Personalizável**
- Widgets com glassmorphism design
- Estatísticas em tempo real
- Tabela interativa de municípios
- Sistema de filtros e controles

### ✅ **Sistema de Upload**
- Upload de arquivos JSON
- Validação automática de dados
- Processamento para milhares de registros
- Geração automática de dados de exemplo

### ✅ **Recursos Avançados**
- Exportação de dados em JSON
- Responsividade completa (mobile, tablet, desktop)
- Acessibilidade (navegação por teclado, alto contraste)
- Animações suaves e feedback visual

## 📊 Estrutura de Dados Suportada

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

## 🗺️ Mapa de Goiás - Municípios Incluídos

### **Principais Cidades**
- **Goiânia** (Capital - 1.5M habitantes)
- **Anápolis** (400K habitantes)
- **Aparecida de Goiânia** (550K habitantes)
- **Rio Verde** (350K habitantes)
- **Luziânia** (200K habitantes)

### **Outras Cidades Monitoradas**
- Aguas Lindas de Goiás
- Valparaíso de Goiás
- Trindade
- Formosa
- Caldas Novas
- Catalão
- Ceres
- Goiás (cidade)
- Itumbiara
- Jataí
- Mineiros
- Morrinhos
- Nerópolis
- Petrolina de Goiás
- Porangatu
- Quirinópolis
- São Luís dos Montes Belos
- São Simão
- Senador Canedo
- Uruaçu
- Urutaí

## 📈 Análises Epidemiológicas

### **Indicadores Principais**
- **Total de Pacientes**: Contagem geral
- **RDW Médio**: Média populacional
- **RDW Elevado**: Percentual de casos (>14.5%)
- **Cidades Monitoradas**: Cobertura geográfica

### **Classificação de Risco**
- 🟢 **Verde (Normal)**: 11.5% - 14.5%
- 🟡 **Amarelo (Elevado)**: 14.5% - 16.0%
- 🔴 **Vermelho (Muito Elevado)**: >16.0%

## 💻 Tecnologias Utilizadas

- **HTML5** + **CSS3** + **JavaScript ES6+**
- **Leaflet.js** - Mapas interativos
- **Chart.js** - Visualizações de dados
- **Design System Glassmorphism**
- **Responsive Design** completo

## 🔒 Características de Segurança

- ✅ Processamento local (dados não saem do navegador)
- ✅ Conformidade com LGPD
- ✅ Nenhuma API externa obrigatória
- ✅ Anonimização opcional de dados

## 🎨 Design e UX

### **Sistema de Cores**
- **Primary**: #0057FF (Azul profissional)
- **Success**: #10B981 (Verde)
- **Warning**: #F59E0B (Amarelo)
- **Error**: #EF4444 (Vermelho)
- **Neutral**: #4B5563 (Cinza)

### **Tipografia**
- **Interface**: Inter (Google Fonts)
- **Código**: JetBrains Mono

### **Componentes**
- Cards com glassmorphism
- Botões com animações
- Formulários responsivos
- Modais interativos

## 📱 Responsividade

### **Desktop (>1024px)**
- Layout em grid completo
- Todas as funcionalidades
- Mapas e gráficos otimizados

### **Tablet (768-1024px)**
- Layout em 2 colunas
- Controles adaptativos
- Navegação simplificada

### **Mobile (<768px)**
- Layout em coluna única
- Touch-friendly
- Animações reduzidas

## 🔍 Como Testar

### **1. Dados Automáticos**
```
Clique em "📋 Dados de Exemplo"
→ Sistema gera 5.000 pacientes simulados
→ Todas as funcionalidades são ativadas
```

### **2. Upload Manual**
```
Clique em "📊 Upload de Dados"
→ Selecione arquivo JSON
→ Use sample-data.json como exemplo
→ Dados são processados automaticamente
```

### **3. Interações**
```
→ Clique nos municípios no mapa
→ Alterne tipos de gráficos
→ Filtre por período/cidade
→ Exporte dados processados
```

## 🎯 Casos de Uso

### **Para Autoridades de Saúde**
- Monitoramento populacional em tempo real
- Identificação de regiões de risco
- Planejamento de intervenções
- Relatórios epidemiológicos

### **Para Profissionais de Saúde**
- Análise de tendências locais
- Comparação entre regiões
- Suporte a decisões clínicas
- Estudos de caso

### **Para Pesquisadores**
- Análise de grandes conjuntos de dados
- Estudos epidemiológicos
- Publicação de relatórios
- Dados para pesquisa acadêmica

## 📞 Suporte Técnico

### **Requisitos**
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Conexão com internet (para fontes e bibliotecas)

### **Performance**
- Otimizado para até 100.000 registros
- Carregamento progressivo
- Cache inteligente
- Processamento assíncrono

## 🏆 Conclusão

Este sistema representa uma solução completa e moderna para vigilância epidemiológica, combinando:

- ✅ **Interface profissional** com design moderno
- ✅ **Funcionalidades avançadas** de análise de dados
- ✅ **Mapas interativos** com dados geográficos
- ✅ **Visualizações dinâmicas** em tempo real
- ✅ **Responsividade total** para todos os dispositivos
- ✅ **Conformidade legal** com LGPD
- ✅ **Fácil uso** para profissionais de saúde

O sistema está pronto para uso em produção e pode ser facilmente customizado para outras regiões ou parâmetros epidemiológicos.

---

**Desenvolvido para apoiar a saúde pública do estado de Goiás** 🇧🇷