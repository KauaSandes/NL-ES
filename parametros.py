def avaliar_hemograma(dados, sexo):
    """
    Recebe um dicionário com os parâmetros do hemograma e o sexo do paciente.
    Retorna um dicionário com a interpretação e o resultado geral.
    """
    resultado = {}
    achados = []

    # Converte valores numéricos com segurança (aceita "13,4", "", None, etc.)
    def parse(v):
        try:
            return float(str(v).replace(",", "."))
        except (TypeError, ValueError):
            return 0.0

    hemoglobina = parse(dados.get("hemoglobina"))
    hematocrito = parse(dados.get("hematocrito"))
    rbc = parse(dados.get("rbc"))
    vcm = parse(dados.get("vcm"))
    hcm = parse(dados.get("hcm"))
    chcm = parse(dados.get("chcm"))
    rdw = parse(dados.get("rdw"))
    reticulocitos = parse(dados.get("reticulocitos"))

    # --- Hemoglobina ---
    if str(sexo).upper() == "M":
        if hemoglobina < 13.0:
            achados.append("hemoglobina baixa (anemia)")
        elif hemoglobina > 17.0:
            achados.append("hemoglobina alta (possível policitemia)")
    else:
        if hemoglobina < 12.0:
            achados.append("hemoglobina baixa (anemia)")
        elif hemoglobina > 16.0:
            achados.append("hemoglobina alta (possível policitemia)")

    # --- Hematócrito ---
    if (str(sexo).upper() == "M" and hematocrito < 40) or (str(sexo).upper() == "F" and hematocrito < 36):
        achados.append("hematócrito baixo (anemia)")
    elif (str(sexo).upper() == "M" and hematocrito > 52) or (str(sexo).upper() == "F" and hematocrito > 48):
        achados.append("hematócrito alto (possível desidratação)")

    # --- RBC ---
    if (str(sexo).upper() == "M" and rbc < 4.5) or (str(sexo).upper() == "F" and rbc < 4.0):
        achados.append("contagem de hemácias baixa")
    elif (str(sexo).upper() == "M" and rbc > 6.0) or (str(sexo).upper() == "F" and rbc > 5.4):
        achados.append("hemácias elevadas (policitemia)")

    # --- VCM ---
    if vcm < 80:
        achados.append("anemia microcítica")
    elif vcm > 100:
        achados.append("anemia macrocítica")

    # --- HCM / CHCM ---
    if hcm < 27 or chcm < 31:
        achados.append("anemia hipocrômica")

    # --- RDW ---
    if rdw > 15:
        achados.append("anisocitose (variação no tamanho das hemácias)")

    # --- Reticulócitos ---
    if reticulocitos > 2.5:
        achados.append("resposta medular aumentada")
    elif reticulocitos < 0.5:
        achados.append("produção medular reduzida")

    # --- Resultado geral ---
    if any("anemia" in a for a in achados):
        resultado_geral = "Indício de anemia: " + ", ".join(a for a in achados if "anemia" in a)
    else:
        resultado_geral = "Sem indício de anemia"

    resultado["resultado_geral"] = resultado_geral
    resultado["achados"] = achados

    return resultado
