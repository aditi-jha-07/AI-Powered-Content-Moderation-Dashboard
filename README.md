# AI-Powered-Content-Moderation-Dashboard
Integrated a Python NLP pipeline (toxicity, hate speech detection) into an event‑driven architecture. A React dashboard displays flagged items in a queue with AI confidence scores, allowing batch actions.
AI‑Powered Content Moderation Dashboard
====================================

NDA Statement: Social media platform and exact post volume are anonymised. The ML pipeline and dashboard represent my work.

Client – A social media platform (anonymised)
Role – Full‑Stack Engineer
Duration – 6 months

Problem Statement
Manual moderation of 1M+ posts/day was unsustainable. Needed an AI‑first dashboard that surfaces high‑risk content for human review.

Solution
Integrated a Python NLP pipeline (toxicity, hate speech detection) into an event‑driven architecture. A React dashboard displays flagged items in a queue with AI confidence scores, allowing batch actions.

Key Features

Real‑time ingestion from Kafka (post events)

NLP models served via TensorFlow Serving

Moderator queue with bulk approve/reject

Appeals and escalation workflows

Analytics on moderation accuracy and throughput

Tech Stack

Frontend: React, Ant Design, WebSockets

Backend: Python (FastAPI), Celery, PostgreSQL

ML: Hugging Face Transformers, TensorFlow Extended

Infra: Docker, Kubernetes, Prometheus

Outcome

Reduced human review workload by 70% while maintaining 98% recall on policy violations

Average moderation time per item dropped from 45s to 8s
