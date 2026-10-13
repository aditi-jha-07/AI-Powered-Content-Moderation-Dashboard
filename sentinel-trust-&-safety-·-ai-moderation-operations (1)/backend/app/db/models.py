"""
PostgreSQL Database Models (SQLAlchemy ORM)
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class ModeratedPost(Base):
    __tablename__ = "moderated_posts"

    id = Column(String(64), primary_key=True)
    kafka_offset = Column(Integer, index=True)
    kafka_topic = Column(String(128), default="events.feed.posts.flagged.v2")
    created_at = Column(DateTime, default=datetime.utcnow)
    content_type = Column(String(32), default="post")
    content = Column(Text, nullable=False)
    
    author_id = Column(String(64), index=True)
    author_trust_score = Column(Integer, default=50)
    
    primary_violation = Column(String(64))
    risk_level = Column(String(32), default="high")
    
    scores = Column(JSON)  # overall_risk, toxicity, hate_speech, etc.
    highlighted_spans = Column(JSON)
    
    status = Column(String(32), default="pending", index=True) # pending, approved, rejected, escalated
    
    moderator_id = Column(String(64), nullable=True)
    moderator_action = Column(String(32), nullable=True)
    moderator_reason = Column(String(128), nullable=True)
    moderator_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    inference_latency_ms = Column(Float)
    model_version = Column(String(64))

class Appeal(Base):
    __tablename__ = "appeals"

    id = Column(String(64), primary_key=True)
    post_id = Column(String(64), ForeignKey("moderated_posts.id"))
    author_id = Column(String(64), index=True)
    user_justification = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(32), default="pending")  # pending, upheld, overturned
    reviewer_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
