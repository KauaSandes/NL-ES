#!/usr/bin/env python3
"""
Sistema Sentinela RDW - Vigilância Nutricional em Saúde Pública
================================================================

Este script analisa dados de hemogramas em formato JSON para identificar
precocemente grupos populacionais (bairros) em risco nutricional, usando
o parâmetro RDW (Red Cell Distribution Width) como indicador principal.

Autor: Sistema de Vigilância em Saúde Pública
Data: 2025
"""

import json
import os
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# ===== CONSTANTES DO SISTEMA =====
LIMIAR_RDW_CRITICO = 14.5  # Limite superior da normalidade para RDW
LIMIAR_RDW_MEDIO_ALERTA = 14.0  # Limite para RDW médio do bairro
LIMIAR_PERCENT_ELEVADO = 25.0  # Porcentagem mínima de exames elevados para alerta

# Diretório padrão para leitura dos dados
DIRETORIO_DADOS_PADRAO = "./dados/"


def carregar_dados_hemogramas(diretorio: str = DIRETORIO_DADOS_PADRAO) -> List[Dict]:
    """
    Carrega e valida dados de hemogramas de arquivos JSON em um diretório.
    
    Args:
        diretorio (str): Caminho para o diretório contendo os arquivos JSON
        
    Returns:
        List[Dict]: Lista de dicionários com dados válidos extraídos
    """
    dados_validos = []
    diretorio_path = Path(diretorio)
    
    if not diretorio_path.exists():
        print(f"⚠️  Diretório {diretorio} não encontrado!")
        return dados_validos
    
    arquivos_json = list(diretorio_path.glob("*.json"))
    
    if not arquivos_json:
        print(f"⚠️  Nenhum arquivo JSON encontrado em {diretorio}")
        return dados_validos
    
    print(f"📁 Processando {len(arquivos_json)} arquivos JSON...")
    
    for arquivo in arquivos_json:
        try:
            with open(arquivo, 'r', encoding='utf-8') as f:
                dados = json.load(f)
            
            # Validar e extrair campos necessários
            dados_extraidos = extrair_campos_necessarios(dados, arquivo.name)
            if dados_extraidos:
                dados_validos.append(dados_extraidos)
                
        except json.JSONDecodeError as e:
            print(f"❌ Erro ao ler JSON {arquivo.name}: {e}")
        except Exception as e:
            print(f"❌ Erro inesperado ao processar {arquivo.name}: {e}")
    
    print(f"✅ {len(dados_validos)} exames válidos carregados de {len(arquivos_json)} arquivos")
    return dados_validos


def extrair_campos_necessarios(dados: Dict, nome_arquivo: str) -> Optional[Dict]:
    """
    Extrai e valida os campos necessários de um registro de hemograma.
    
    Args:
        dados (Dict): Dados do hemograma em formato JSON
        nome_arquivo (str): Nome do arquivo para logs de erro
        
    Returns:
        Optional[Dict]: Dicionário com campos extraídos ou None se inválido
    """
    try:
        # Extrair RDW
        rdw = dados['resultados_hemograma']['rdw_cv_percent']
        
        # Extrair bairro
        bairro = dados['dados_demograficos']['localidade']['bairro']
        
        # Validar tipos e valores
        if not isinstance(rdw, (int, float)) or rdw <= 0:
            print(f"⚠️  RDW inválido em {nome_arquivo}: {rdw}")
            return None
            
        if not isinstance(bairro, str) or not bairro.strip():
            print(f"⚠️  Bairro inválido em {nome_arquivo}: {bairro}")
            return None
        
        return {
            'rdw_cv_percent': float(rdw),
            'bairro': bairro.strip(),
            'id_paciente': dados.get('id_paciente', 'N/A'),
            'data_coleta': dados.get('data_coleta', 'N/A')
        }
        
    except KeyError as e:
        print(f"⚠️  Campo obrigatório ausente em {nome_arquivo}: {e}")
        return None
    except Exception as e:
        print(f"⚠️  Erro ao extrair dados de {nome_arquivo}: {e}")
        return None


def analisar_dados_por_bairro(dados: List[Dict]) -> pd.DataFrame:
    """
    Realiza análise agregada dos dados de RDW por bairro.
    
    Args:
        dados (List[Dict]): Lista de dados válidos de hemogramas
        
    Returns:
        pd.DataFrame: DataFrame com estatísticas por bairro
    """
    if not dados:
        print("❌ Nenhum dado válido para análise!")
        return pd.DataFrame()
    
    # Converter para DataFrame
    df = pd.DataFrame(dados)
    
    # Calcular estatísticas por bairro
    estatisticas = df.groupby('bairro').agg({
        'rdw_cv_percent': ['count', 'mean']
    }).round(2)
    
    # Achatar colunas multi-nível
    estatisticas.columns = ['num_exames', 'rdw_medio']
    
    # Calcular porcentagem de RDW elevado
    rdw_elevado_por_bairro = df[df['rdw_cv_percent'] > LIMIAR_RDW_CRITICO].groupby('bairro').size()
    estatisticas['exames_rdw_elevado'] = rdw_elevado_por_bairro.fillna(0).astype(int)
    estatisticas['percent_rdw_elevado'] = (
        (estatisticas['exames_rdw_elevado'] / estatisticas['num_exames']) * 100
    ).fillna(0).round(2)
    
    # Ordenar por RDW médio (decrescente)
    estatisticas = estatisticas.sort_values('rdw_medio', ascending=False)
    
    return estatisticas


def identificar_areas_alerta(estatisticas: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Identifica áreas de alerta nutricional baseado nos critérios estabelecidos.
    
    Args:
        estatisticas (pd.DataFrame): DataFrame com estatísticas por bairro
        
    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: (áreas_alerta, outras_areas)
    """
    if estatisticas.empty:
        return pd.DataFrame(), pd.DataFrame()
    
    # Critérios para área de alerta
    condicao_alerta = (
        (estatisticas['rdw_medio'] > LIMIAR_RDW_MEDIO_ALERTA) &
        (estatisticas['percent_rdw_elevado'] > LIMIAR_PERCENT_ELEVADO)
    )
    
    areas_alerta = estatisticas[condicao_alerta]
    outras_areas = estatisticas[~condicao_alerta]
    
    return areas_alerta, outras_areas


def gerar_relatorio(areas_alerta: pd.DataFrame, outras_areas: pd.DataFrame) -> None:
    """
    Gera e exibe o relatório formatado de vigilância nutricional.
    
    Args:
        areas_alerta (pd.DataFrame): DataFrame com áreas de alerta
        outras_areas (pd.DataFrame): DataFrame com outras áreas analisadas
    """
    print("\n" + "=" * 60)
    print("RELATÓRIO DE VIGILÂNCIA NUTRICIONAL - SENTINELA RDW")
    print("=" * 60)
    
    # Seção de áreas de alerta
    if not areas_alerta.empty:
        print("\n🚨 ÁREAS DE ALERTA NUTRICIONAL IDENTIFICADAS 🚨\n")
        
        for bairro, dados in areas_alerta.iterrows():
            print(f"[ALERTA] Bairro: {bairro}")
            print(f"  Exames Processados: {dados['num_exames']}")
            print(f"  RDW Médio: {dados['rdw_medio']:.2f}%")
            print(f"  Exames com RDW > {LIMIAR_RDW_CRITICO}%: {dados['percent_rdw_elevado']:.2f}%")
            print()
    else:
        print("\n✅ NENHUMA ÁREA DE ALERTA NUTRICIONAL IDENTIFICADA")
    
    # Seção de análise geral
    if not outras_areas.empty:
        print("\n--- ANÁLISE GERAL DOS BAIRROS ---\n")
        
        for bairro, dados in outras_areas.iterrows():
            print(f"Bairro: {bairro}")
            print(f"  Exames Processados: {dados['num_exames']}")
            print(f"  RDW Médio: {dados['rdw_medio']:.2f}%")
            print(f"  Exames com RDW > {LIMIAR_RDW_CRITICO}%: {dados['percent_rdw_elevado']:.2f}%")
            print()
    
    print("=" * 60)


def main():
    """
    Função principal do sistema Sentinela RDW.
    """
    print("🏥 Sistema Sentinela RDW - Vigilância Nutricional")
    print("Iniciando análise de dados de hemogramas...\n")
    
    # 1. Carregar dados
    dados = carregar_dados_hemogramas()
    
    if not dados:
        print("❌ Nenhum dado válido encontrado. Verifique o diretório de dados.")
        return
    
    # 2. Analisar dados por bairro
    print("\n📊 Realizando análise agregada por bairro...")
    estatisticas = analisar_dados_por_bairro(dados)
    
    if estatisticas.empty:
        print("❌ Erro na análise dos dados.")
        return
    
    # 3. Identificar áreas de alerta
    print("🔍 Identificando áreas de alerta nutricional...")
    areas_alerta, outras_areas = identificar_areas_alerta(estatisticas)
    
    # 4. Gerar relatório
    gerar_relatorio(areas_alerta, outras_areas)
    
    # Resumo final
    total_bairros = len(estatisticas)
    total_alertas = len(areas_alerta)
    total_exames = estatisticas['num_exames'].sum()
    
    print(f"\n📈 RESUMO DA ANÁLISE:")
    print(f"  • Total de bairros analisados: {total_bairros}")
    print(f"  • Áreas em alerta nutricional: {total_alertas}")
    print(f"  • Total de exames processados: {total_exames}")
    print(f"  • Taxa de alerta: {(total_alertas/total_bairros*100):.1f}%" if total_bairros > 0 else "  • Taxa de alerta: 0.0%")


if __name__ == "__main__":
    main()