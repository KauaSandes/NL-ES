import os
import json
import re
import google.generativeai as genai

RESULTADOS_DIR = "resultados"
os.makedirs(RESULTADOS_DIR, exist_ok=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "SUA_CHAVE_AQUI"
genai.configure(api_key=GEMINI_API_KEY)


def _extrair_json_do_texto(texto: str):
    """Procura o primeiro bloco JSON em um texto e converte se possível."""
    m = re.search(r"\{.*\}", texto, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except Exception:
        return None


def _normalizar_para_planos(dados):
    """
    Garante chaves simples no JSON final:
    hemoglobina, hematocrito, rbc, vcm, hcm, chcm, rdw, reticulocitos
    Mantém 'paciente' se houver.
    """
    planos = {}
    for k in ["hemoglobina","hematocrito","rbc","vcm","hcm","chcm","rdw","reticulocitos"]:
        if k in dados:
            planos[k] = dados[k]

    if "parametros" in dados and isinstance(dados["parametros"], list):
        for p in dados["parametros"]:
            nome = p.get("nome", "").lower()
            valor = p.get("resultado", "")
            if not valor:
                continue
            val_text = str(valor).replace(",", ".")
            try:
                if "hemoglob" in nome:
                    planos["hemoglobina"] = float(val_text)
                elif "hematoc" in nome:
                    planos["hematocrito"] = float(val_text)
                elif "hemácias" in nome or "rbc" in nome:
                    planos["rbc"] = float(val_text)
                elif "vcm" in nome:
                    planos["vcm"] = float(val_text)
                elif "hcm" in nome:
                    planos["hcm"] = float(val_text)
                elif "chcm" in nome:
                    planos["chcm"] = float(val_text)
                elif "rdw" in nome:
                    planos["rdw"] = float(val_text)
                elif "reticul" in nome:
                    planos["reticulocitos"] = float(val_text)
            except Exception:
                pass

    for k, v in list(planos.items()):
        if isinstance(v, str):
            try:
                planos[k] = float(v.replace(",", "."))
            except Exception:
                pass

    # mantém dados do paciente se existirem
    if "paciente" in dados:
        planos["paciente"] = dados["paciente"]
    if "sexo" in dados:
        planos["sexo"] = dados["sexo"]

    return planos


def transcrever_hemograma(caminho_pdf):
    modelo = genai.GenerativeModel("gemini-2.0-flash")

    with open(caminho_pdf, "rb") as f:
        conteudo_pdf = f.read()

    prompt = (
        "Extraia os dados do hemograma no arquivo enviado e devolva **somente** "
        "um JSON válido no formato:\n\n"
        "{\n"
        "  'paciente': {'nome':'', 'idade':'', 'sexo':''},\n"
        "  'hemoglobina':'', 'hematocrito':'', 'rbc':'', 'vcm':'', "
        "'hcm':'', 'chcm':'', 'rdw':'', 'reticulocitos':''\n"
        "}\n\n"
        "⚠️ Não adicione explicações, texto extra ou markdown. Responda apenas com JSON puro."
    )

    try:
        resposta = modelo.generate_content(
            [
                {
                    "role": "user",
                    "parts": [
                        {"text": prompt},
                        {"mime_type": "application/pdf", "data": conteudo_pdf}
                    ],
                }
            ],
            generation_config={"response_mime_type": "application/json"},
        )

        texto_resposta = getattr(resposta, "text", None)
        if not texto_resposta:
            if hasattr(resposta, "candidates") and resposta.candidates:
                parts = resposta.candidates[0].content.parts
                texto_resposta = "".join(p.text for p in parts if hasattr(p, "text"))

        if not texto_resposta or not texto_resposta.strip():
            print(f"⚠️ Nenhum texto retornado pelo Gemini para {caminho_pdf}")
            return None

        texto_resposta = texto_resposta.strip()
        print(f"\n📄 RESPOSTA BRUTA ({caminho_pdf}):")
        print(texto_resposta[:600])

        try:
            dados = json.loads(texto_resposta)
        except json.JSONDecodeError:
            dados = _extrair_json_do_texto(texto_resposta)

        if not dados:
            print(f"⚠️ Erro ao converter o resultado do Gemini para JSON ({caminho_pdf})")
            return None

        planos = _normalizar_para_planos(dados)
        return planos

    except Exception as e:
        print(f"❌ Erro ao processar {caminho_pdf}: {e}")
        return None


def processar_pasta_hemogramas():
    pasta_entrada = "hemogramas"
    if not os.path.exists(pasta_entrada):
        print("Pasta hemogramas/ inexistente.")
        return

    for arquivo in os.listdir(pasta_entrada):
        if arquivo.lower().endswith(".pdf"):
            transcrever_hemograma(os.path.join(pasta_entrada, arquivo))


if __name__ == "__main__":
    processar_pasta_hemogramas()
