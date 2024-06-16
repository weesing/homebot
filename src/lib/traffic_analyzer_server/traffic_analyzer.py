from flask import Flask, request
import glob
import json
import os
from dotenv.main import load_dotenv, find_dotenv
from langchain.prompts.prompt import PromptTemplate
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

print(find_dotenv())
load_dotenv(find_dotenv())

def init_llm():
  # Google API. https://python.langchain.com/v0.2/docs/integrations/platforms/google/
  # Need to define GOOGLE_API_KEY in .env
  llm = ChatGoogleGenerativeAI(
      model='gemini-1.5-flash', 
      temperature=0,
      google_api_key=os.getenv("GOOGLE_AI_API_KEY")
  )

  # Use HuggingFace model
  # llm = init_huggingface()

  return llm

llm = init_llm()

def exec_process_gpt(system_prompt, user_prompt, file_path=""):
  system_message = SystemMessage(content=[
    {
      "type": "text",
      "text": system_prompt 
    }
  ])
  human_message = HumanMessage(
    content=[
      {
        "type": "text",
        "text": user_prompt,
      },
      {"type": "image_url", "image_url": file_path},
    ]
  )
  
  res = llm.invoke([system_message, human_message])
  return res

app = Flask(__name__)

@app.route("/api/analyze", methods=["POST"])
def analyze():
  # This is where you would add logic to handle the POST request data
  # You can access the request data using `request.json`
  # For example:
  data = request.json
  print(f"Received data: {data}")
  system_prompt=data["system_prompt"]
  user_prompt=data["user_prompt"]
  file_path=data["file_path"]
  # Process the data and return a response
  result = exec_process_gpt(system_prompt=system_prompt, user_prompt=user_prompt, file_path=file_path)
  return { result:result }, 200
