
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import json


app = FastAPI()

# Adiciona o middleware CORS para permitir requisições do navegador
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],  
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

REALM = "stackspot-freemium"
CLIENT_ID = "f56b6b65-6488-4401-9a94-c4c211654497"
CLIENT_KEY = "y5Hlvve2jo2ci23HdzhafYpYni04l43BBY12MemAER5LqR5rdfy57ZA5g76CF93o"
AGENT_URL = "https://genai-inference-app.stackspot.com/v1/agent/01K3GT29GMFY5HMCEM7F8HSNKN/chat"

def get_jwt():
	url = f"https://idm.stackspot.com/{REALM}/oidc/oauth/token"
	payload = {
		"grant_type": "client_credentials",
		"client_id": CLIENT_ID,
		"client_secret": CLIENT_KEY
	}
	headers = {"Content-Type": "application/x-www-form-urlencoded"}
	response = requests.post(url, data=payload, headers=headers)
	if response.status_code != 200:
		raise HTTPException(status_code=401, detail="Erro na autenticação")
	return response.json().get("access_token")

@app.post("/chat")
async def chat(request: Request):
	body = await request.json()
	user_prompt = body.get("user_prompt")
	
	# Se user_prompt for um dict, é transformado em um texto estruturado
	if isinstance(user_prompt, dict):
		user_prompt = "\n".join([f"{k}: {v}" for k, v in user_prompt.items()])
	jwt = get_jwt()
	headers = {
		"Content-Type": "application/json",
		"Authorization": f"Bearer {jwt}"
	}
	data = {
		"streaming": True,
		"user_prompt": user_prompt,
		"stackspot_knowledge": False,
		"return_ks_in_response": True
	}
	response = requests.post(AGENT_URL, json=data, headers=headers)
	
	# processamento do stream de dados
	result = []
	for line in response.text.splitlines():
		if line.startswith("data:"):
			try:
				json_data = json.loads(line[5:].strip())
				result.append(json_data)
			except Exception:
				continue

	texto_final = "".join([item.get("message", "") for item in result])
	return {"texto": texto_final}

if __name__ == "__main__":
	import uvicorn
	uvicorn.run("saude_mais:app", host="127.0.0.1", port=8000, reload=True)
