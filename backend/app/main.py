from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
import uuid
import sys
import os

# Import our compiled graph from agents.graph
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.agents.graph import graph

app = FastAPI(title="Aura-Flow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    task: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/run-flow")
async def run_flow(req: TaskRequest):
    def event_stream():
        thread_id = str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}
        
        initial_state = {
            "messages": [req.task], 
            "current_task": req.task,
            "test_errors": "",
            "code_written": ""
        }
        
        try:
            for event in graph.stream(initial_state, config=config):
                for node_name, state_update in event.items():
                    data = {
                        "node": node_name,
                        "state_update": state_update
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                    
            yield "data: {\"finished\": true}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(event_stream(), media_type="text/event-stream")
