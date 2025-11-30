from flask import Flask, render_template, request, redirect, url_for
import os
import json
from parametros import avaliar_hemograma
from transcrever_hemograma import transcrever_hemograma
from graphs import preparar_dados_grafico

import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)

HEMOGRAMAS_DIR = "hemogramas"
RESULTADOS_DIR = "resultados"
os.makedirs(HEMOGRAMAS_DIR, exist_ok=True)
os.makedirs(RESULTADOS_DIR, exist_ok=True)


def safe_float(v):
    try:
        return float(str(v).replace(",", "."))
    except Exception:
        return 0.0


def carregar_hemogramas():
    """
    Lê todos os JSONs em RESULTADOS_DIR e retorna lista de dicts
    já com campos numéricos convertidos e paciente como nome.
    """
    hemogramas = []
    for arquivo in os.listdir(RESULTADOS_DIR):
        if arquivo.endswith(".json"):
            caminho = os.path.join(RESULTADOS_DIR, arquivo)
            with open(caminho, "r", encoding="utf-8") as f:
                dados = json.load(f)

            # tenta obter sexo do JSON; se não existir, tenta dentro de paciente
            sexo = dados.get("sexo")
            if not sexo and isinstance(dados.get("paciente"), dict):
                sexo = dados["paciente"].get("sexo")
            if not sexo:
                sexo = "M"

            # normaliza os parâmetros numéricos
            parametros = {
                "hemoglobina": safe_float(dados.get("hemoglobina")),
                "hematocrito": safe_float(dados.get("hematocrito")),
                "rbc": safe_float(dados.get("rbc")),
                "vcm": safe_float(dados.get("vcm")),
                "hcm": safe_float(dados.get("hcm")),
                "chcm": safe_float(dados.get("chcm")),
                "rdw": safe_float(dados.get("rdw")),
                "reticulocitos": safe_float(dados.get("reticulocitos"))
            }

            # Avalia com a função existente
            avaliacao = avaliar_hemograma(dados, sexo)
            if not avaliacao:
                dados["resultado_geral"] = "Indefinido"
                dados["achados"] = []
            else:
                dados["resultado_geral"] = avaliacao.get("resultado_geral", "Indefinido")
                dados["achados"] = avaliacao.get("achados", [])

            # pega nome do paciente para exibição
            paciente_display = dados.get("paciente")
            if isinstance(paciente_display, dict):
                paciente_nome = paciente_display.get("nome", os.path.splitext(arquivo)[0])
                sexo_display = paciente_display.get("sexo", sexo)
            else:
                paciente_nome = dados.get("paciente", os.path.splitext(arquivo)[0])
                sexo_display = sexo

            hemogramas.append({
                "arquivo": arquivo,
                "paciente": paciente_nome,
                "sexo": sexo_display,
                "hemoglobina": parametros["hemoglobina"],
                "hematocrito": parametros["hematocrito"],
                "rbc": parametros["rbc"],
                "vcm": parametros["vcm"],
                "hcm": parametros["hcm"],
                "chcm": parametros["chcm"],
                "rdw": parametros["rdw"],
                "reticulocitos": parametros["reticulocitos"],
                "resultado_geral": dados["resultado_geral"],
                "achados": dados["achados"]
            })

    return hemogramas


@app.route("/")
def index():
    # envia a lista de hemogramas para o template (corrige tabela vazia)
    hemogramas = carregar_hemogramas()
    return render_template("index.html", hemogramas=hemogramas)


@app.route("/upload", methods=["POST"])
def upload_pdf():
    arquivo = request.files.get("arquivo")
    if not arquivo or not arquivo.filename.lower().endswith(".pdf"):
        return redirect(url_for("index"))

    caminho_pdf = os.path.join(HEMOGRAMAS_DIR, arquivo.filename)
    arquivo.save(caminho_pdf)

    # Transcreve o PDF e gera JSON automaticamente
    resultado = transcrever_hemograma(caminho_pdf)
    if resultado:
        nome_json = os.path.splitext(arquivo.filename)[0] + ".json"
        caminho_json = os.path.join(RESULTADOS_DIR, nome_json)
        with open(caminho_json, "w", encoding="utf-8") as f:
            json.dump(resultado, f, indent=4, ensure_ascii=False)

    return redirect(url_for("index"))


@app.route("/detalhes/<nome_arquivo>")
def detalhes(nome_arquivo):
    caminho = os.path.join(RESULTADOS_DIR, nome_arquivo)
    with open(caminho, "r", encoding="utf-8") as f:
        dados = json.load(f)
    return render_template("detalhes.html", h=dados, nome_arquivo=nome_arquivo)


# rota que lista os parâmetros (link na home)
@app.route("/graficos")
def graficos():
    parametros = [
        "hemoglobina",
        "hematocrito",
        "rbc",
        "vcm",
        "hcm",
        "chcm",
        "rdw",
        "reticulocitos"
    ]
    # usa lista_graficos.html (mostra "Gráficos dos parâmetros")
    return render_template("lista_graficos.html", parametros=parametros)


# rota que gera gráfico PNG no servidor e embute na página como base64
@app.route("/grafico/<parametro>")
def grafico(parametro):
    hemogramas = carregar_hemogramas()
    dados = preparar_dados_grafico(hemogramas, parametro)

    labels = dados["labels"]
    valores = dados["valores"]
    minimo = dados["minimo"]
    maximo = dados["maximo"]

    fig, ax = plt.subplots(figsize=(10, 4))

    # linha dos valores reais
    ax.plot(labels, valores, marker="o", linewidth=2, label="Valor do paciente")

    # linha mínima (verde)
    ax.axhline(minimo, color="green", linestyle="--", linewidth=1.5, label=f"Mínimo ({minimo})")

    # linha máxima (vermelho)
    ax.axhline(maximo, color="red", linestyle="--", linewidth=1.5, label=f"Máximo ({maximo})")

    ax.set_title(f"Gráfico de {parametro.upper()}")
    ax.set_xlabel("Coletas")
    ax.set_ylabel(parametro)
    ax.legend()

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close()

    return render_template("grafico_server.html", parametro=parametro, img_base64=img_base64)


if __name__ == "__main__":
    app.run(debug=True)
