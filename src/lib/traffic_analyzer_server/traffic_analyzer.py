from flask import Flask, request
import glob
import json
import os
from dotenv import load_dotenv,find_dotenv
from langchain.prompts.prompt import PromptTemplate
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
import google.generativeai as googgenai
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
  chat_prompt_template = ChatPromptTemplate.from_messages(
      [
          ("system", system_prompt),
          ("user", user_prompt)
      ]
  )

  messages = chat_prompt_template.format_messages(file_path=file_path)
  chain = ChatPromptTemplate.from_messages(messages) | llm | StrOutputParser()
  res = chain.invoke(input={})
  ans = res.strip()
  return ans

app = Flask(__name__)

@app.route("/api/analyze", methods=["POST"])
def analyze():
  # This is where you would add logic to handle the POST request data
  # You can access the request data using `request.json`
  # For example:
  data = request.json
  print(f"Received data: {data}")
  system_prompt=""
  user_prompt=""
  file_path=""
  # Process the data and return a response
  # result = exec_process_gpt(system_prompt=system_prompt, user_prompt=user_prompt, file_path=file_path)
  return "Data received successfully!", 200
