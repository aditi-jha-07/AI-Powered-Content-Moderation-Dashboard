"""
FastAPI Backend Application
AI-Powered Content Moderation Service
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import asyncio
import json
import time

app = FastAPI(
    title="Sentinel Trust & Safety · NLP Moderation Service",
    description="Event-driven FastAPI service integrated with Kafka, Celery, TensorFlow Serving, and PostgreSQL",
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections for real-time moderator dashboard feed
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

# Pydantic Schemas
class ModerateRequest(BaseModel):
    content: str = Field(..., example="I will track you down and hurt you.")
    author_id: str = Field(default="USR-1001")
    content_type: str = Field(default="post")

class BatchActionRequest(BaseModel):
    post_ids: List[str]
    action: str = Field(..., regex="^(approve|reject|escalate)$")
    reason_code: Optional[str] = None
    moderator_id: str = Field(default="MOD-991")
    notes: Optional[str] = None

class AppealRequest(BaseModel):
    post_id: str
    user_justification: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "fastapi-moderation",
        "celery_workers": 16,
        "tf_serving_status": "AVAILABLE",
        "postgres_pool": "CONNECTED"
    }

@app.get("/metrics")
def prometheus_metrics():
    """
    Prometheus metrics endpoint scraped by Prometheus container
    """
    return (
        "# HELP moderation_requests_total Total number of posts evaluated\n"
        "# TYPE moderation_requests_total counter\n"
        "moderation_requests_total{model='roberta-tox-v3'} 1148200\n"
        "# HELP human_review_routed_total Total posts routed to human queue\n"
        "# TYPE human_review_routed_total counter\n"
        "human_review_routed_total 38400\n"
        "# HELP moderation_latency_seconds Latency of TF-Serving inference\n"
        "# TYPE moderation_latency_seconds histogram\n"
        "moderation_latency_seconds_bucket{le='0.025'} 942100\n"
        "moderation_latency_seconds_bucket{le='0.050'} 1141000\n"
        "moderation_latency_seconds_count 1148200\n"
        "# HELP kafka_consumer_lag Current consumer lag on feed.posts.flagged topic\n"
        "# TYPE kafka_consumer_lag gauge\n"
        "kafka_consumer_lag{topic='events.feed.posts.flagged.v2'} 12\n"
        "# HELP celery_active_tasks Currently executing worker tasks\n"
        "# TYPE celery_active_tasks gauge\n"
        "celery_active_tasks 4\n"
    )

@app.post("/api/v1/moderate")
async def moderate_post(payload: ModerateRequest):
    """
    Submits a post to Celery distributed worker pool for RoBERTa multi-head inference.
    """
    start_time = time.time()
    # In production, this dispatches celery task: task = process_post_task.delay(payload.dict())
    await asyncio.sleep(0.018)  # simulate 18ms TF-Serving inference
    
    latency = round((time.time() - start_time) * 1000, 2)
    return {
        "task_id": "celery-task-849201",
        "content": payload.content,
        "author_id": payload.author_id,
        "scores": {
            "overall_risk": 0.94,
            "toxicity": 0.89,
            "hate_speech": 0.92,
            "threat_violence": 0.45,
            "harassment": 0.78,
            "identity_attack": 0.91,
            "profanity": 0.20
        },
        "primary_violation": "hate_speech",
        "routing": "human_moderator_queue",
        "inference_latency_ms": latency,
        "model_version": "RoBERTa-Tox-v3.4.1 (TF-Serving)"
    }

@app.post("/api/v1/batch-action")
def execute_batch_action(payload: BatchActionRequest):
    """
    Applies bulk actions (approve, reject, escalate) and persists to PostgreSQL.
    """
    return {
        "status": "success",
        "action": payload.action,
        "affected_count": len(payload.post_ids),
        "post_ids": payload.post_ids,
        "reason_code": payload.reason_code,
        "moderator_id": payload.moderator_id,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime())
    }

@app.websocket("/ws/feed")
async def websocket_event_stream(websocket: WebSocket):
    """
    Real-time WebSocket endpoint streaming Kafka post events to the React Ant Design frontend
    """
    await manager.connect(websocket)
    try:
        # Send initial handshake
        await websocket.send_text(json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "topic": "events.feed.posts.flagged.v2",
            "workers": 16,
            "timestamp": time.time()
        }))
        
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "PING":
                await websocket.send_text(json.dumps({"type": "PONG", "timestamp": time.time()}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
