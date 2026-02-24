from typing import Annotated, Any, Dict, List
from pydantic import BaseModel, Field
import operator
import sys
import os
import re

from dotenv import load_dotenv
load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# Adjust import paths so that running directly from app directory works
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from app.tools.file_ops import write_file
from app.tools.terminal import run_command

class AgentState(BaseModel):
    # Operator.add merges lists rather than overwriting
    messages: Annotated[List[Any], operator.add] = Field(default_factory=list)
    current_task: str = Field(default="")
    code_written: str = Field(default="")
    test_errors: str = Field(default="")
    test_command: str = Field(default="python test_script.py")
    filename: str = Field(default="test_script.py")

def supervisor_node(state: AgentState) -> Dict[str, Any]:
    print("--- SUPERVISOR ---")
    task = state.current_task
    if not task and state.messages:
        task = str(state.messages[-1])
        
    return {
        "current_task": task,
        "messages": [f"Supervisor: Analyzed and queued task '{task[:30]}...'"]
    }

def researcher_node(state: AgentState) -> Dict[str, Any]:
    print("--- RESEARCHER ---")
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0, 
        google_api_key=os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical researcher. Given the user's task, respond with a concise architectural approach, suggested file names, and shell commands to test the code. Output everything as plain text."),
        ("user", "{task}")
    ])
    chain = prompt | llm
    res = chain.invoke({"task": state.current_task})
    msg = "Researcher: Gathered requirements and approach."
    return {
        "messages": [msg, f"Researcher Notes:\n{res.content}"]
    }

def coder_node(state: AgentState) -> Dict[str, Any]:
    print("--- CODER ---")
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.2, 
        google_api_key=os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    )
    
    if state.test_errors:
        system_msg = "You are an expert programmer. Fix the code to resolve the following test errors. You MUST respond with ONLY a valid JSON object containing exactly three string keys: 'filename', 'code', and 'test_command'. Do not include markdown code block formatting like ```json, just the raw JSON object."
        user_msg = "Original Task: {task}\n\nCurrent File: {filename}\n\nCurrent Code (failing):\n{code}\n\nTest Errors:\n{errors}\n\nPlease provide the corrected code, the filename to save it to, and the command to run the tests."
    else:
        system_msg = "You are an expert programmer. Write the full requested code. Include required unit tests in the same file if possible, or build a self-testing script if necessary. You MUST respond with ONLY a valid JSON object containing exactly three string keys: 'filename', 'code', and 'test_command'. Do not include markdown code block formatting like ```json, just the raw JSON object."
        researcher_notes = state.messages[-1] if len(state.messages) > 0 else ""
        user_msg = "Task: {task}\n\nResearcher Notes:\n{notes}"

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_msg),
        ("user", user_msg)
    ])
    
    import json
    max_retries = 3
    parsed_output = None
    for _ in range(max_retries):
        try:
            chain = prompt | llm
            if state.test_errors:
                res = chain.invoke({
                    "task": state.current_task,
                    "filename": state.filename,
                    "code": state.code_written,
                    "errors": state.test_errors
                })
            else:
                res = chain.invoke({
                    "task": state.current_task,
                    "notes": researcher_notes
                })
            
            text = res.content.strip()
            # Clean up potential markdown blocks if the model ignored instructions
            if text.startswith("```json"): text = text[7:]
            if text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            
            parsed_output = json.loads(text.strip())
            break
        except Exception as e:
            print(f"Coder retry due to structural error: {e}")
            
    if not parsed_output:
        raise ValueError("Failed to generate code correctly.")

    filename = parsed_output.get("filename", "test_script.js")
    code = parsed_output.get("code", "")
    test_cmd = parsed_output.get("test_command", "node test_script.js")

    write_status = write_file(filename, code)
    print(f"[Tool Execution] {write_status}")
    
    msg = f"Coder: Wrote code to {filename}. Provided test command: '{test_cmd}'."
    if state.test_errors:
       msg = f"Coder: Fixed code based on errors. Saved to {filename}."

    return {
        "filename": filename,
        "code_written": code,
        "test_command": test_cmd,
        "test_errors": "",
        "messages": [msg]
    }

def verifier_node(state: AgentState) -> Dict[str, Any]:
    print("--- VERIFIER ---")
    cmd = state.test_command
    print(f"[Tool Execution] Running: '{cmd}'")
    result = run_command(cmd)
    
    if result["returncode"] != 0:
        error_log = (result["stderr"] or result["stdout"]).strip()
        msg = f"Verifier: Tests FAILED with exit code {result['returncode']}."
        print(f"[Verifier Result] Failed with exit code:\n{error_log}")
        return {
            "test_errors": error_log,
            "messages": [msg]
        }
    else:
        msg = "Verifier: Tests PASSED."
        print("[Verifier Result] Passed successfully.")
        return {
            "test_errors": "",
            "messages": [msg]
        }

def verifier_router(state: AgentState) -> str:
    if state.test_errors:
        print("--- ROUTING TO CODER ---")
        return "coder"
    else:
        print("--- ROUTING TO END ---")
        return END

builder = StateGraph(AgentState)
builder.add_node("supervisor", supervisor_node)
builder.add_node("researcher", researcher_node)
builder.add_node("coder", coder_node)
builder.add_node("verifier", verifier_node)

builder.add_edge(START, "supervisor")
builder.add_edge("supervisor", "researcher")
builder.add_edge("researcher", "coder")
builder.add_edge("coder", "verifier")

builder.add_conditional_edges("verifier", verifier_router, {"coder": "coder", END: END})

conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "langgraph_checkpoints.sqlite"), check_same_thread=False)
memory = SqliteSaver(conn)
graph = builder.compile(checkpointer=memory)

if __name__ == "__main__":
    pass
