# AI-Powered Family Court Navigation Assistant - MVP Backend Design

**Date:** March 16, 2026
**Status:** Approved
**Architecture:** Modular Monolith (Python + FastAPI)

---

## Executive Summary

This document specifies the design for the Minimum Viable Product (MVP) backend of an AI-powered conversational assistant for self-represented (pro se) litigants navigating family court proceedings. The system integrates real-time court data synchronization, advanced document processing, and Retrieval-Augmented Generation (RAG) to provide accurate, jurisdiction-specific procedural guidance while strictly avoiding the Unauthorized Practice of Law (UPL).

**MVP Scope:**
- User authentication and case management
- Tyler Technologies Odyssey API integration (San Diego Superior Court initially)
- Document upload, OCR, and vectorization
- RAG-powered conversational AI with UPL guardrails
- Real-time court docket synchronization via webhooks

**Out of Scope for MVP:**
- Mobile applications (web-responsive only)
- Multi-state expansion (California only)
- OAuth SSO providers (email/password only)
- Journal Technologies eCourt integration (Phase 2)
- SOC 2/HIPAA certification (security foundation only)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Auth Module  │ Cases Module │ Court Sync   │ Documents      │
│              │              │ Module       │ Module         │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                      RAG Module                              │
├──────────────────────────────────────────────────────────────┤
│                   Shared Services Layer                      │
│         (Database, Cache, Queue, Storage)                    │
└──────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    PostgreSQL          Redis Cache           Celery Workers
    + pgvector          (sessions)           (async tasks)
           │
           ▼
    S3/Cloud Storage
    (documents)
```

### 1.2 Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Framework** | FastAPI 0.104+ | Async-first, excellent performance, auto-generated OpenAPI docs |
| **Language** | Python 3.11+ | Best AI/ML ecosystem, rapid development, strong typing with Pydantic |
| **Database** | PostgreSQL 15+ | ACID compliance, jsonb support, pgvector extension |
| **ORM** | SQLAlchemy 2.0 (async) | Industry standard, async support, type safety |
| **Vector Store** | pgvector | Embedded in PostgreSQL, simpler than external vector DB for MVP |
| **Task Queue** | Celery + Redis | Battle-tested for async tasks, court webhooks, OCR processing |
| **LLM** | Anthropic Claude 3.5 Sonnet | Superior reasoning, 200K context window, zero-retention policy |
| **Embeddings** | OpenAI text-embedding-ada-002 | Industry standard, 1536 dimensions, cost-effective |
| **Storage** | AWS S3 (or MinIO for dev) | Scalable object storage, encryption at rest |
| **OCR** | Google Document AI | Layout-aware parsing, superior accuracy for legal documents |
| **Auth** | JWT (PyJWT) | Stateless, secure, standard for API authentication |

### 1.3 Architectural Principles

1. **Modular Monolith** - Single deployment with strict module boundaries for future microservices extraction
2. **Async-First** - All I/O operations (DB, API, LLM) use async/await for maximum throughput
3. **Event-Driven Background Tasks** - Celery for long-running operations (OCR, embedding, sync)
4. **Stateless API** - JWT tokens, no server-side sessions
5. **Fail-Safe Defaults** - Graceful degradation when AI confidence is low or external APIs fail

---

## 2. Database Schema

### 2.1 Core Tables

```sql
-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- Legal Cases
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    jurisdiction_state VARCHAR(2) NOT NULL,      -- "CA"
    jurisdiction_county VARCHAR(100) NOT NULL,   -- "San Diego"
    case_type VARCHAR(50) NOT NULL,              -- "divorce", "custody", "support"
    docket_number VARCHAR(100),                  -- Court case number
    status VARCHAR(20) DEFAULT 'active',         -- "active", "closed"
    court_system VARCHAR(50),                    -- "tyler_odyssey", "journal_ecourt"
    court_case_id VARCHAR(100),                  -- External court system ID
    court_sync_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(court_system, court_case_id)
);
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_docket_number ON cases(docket_number);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,              -- "application/pdf", "image/jpeg"
    file_size BIGINT NOT NULL,                   -- bytes
    storage_url VARCHAR(512) NOT NULL,           -- S3 path
    source VARCHAR(20) DEFAULT 'user_upload',    -- "user_upload", "court_sync"
    ocr_status VARCHAR(20) DEFAULT 'pending',    -- "pending", "processing", "completed", "failed"
    parsed_text TEXT,
    metadata JSONB DEFAULT '{}',                 -- {page_count, court_filing_date, etc.}
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_ocr_status ON documents(ocr_status);

-- Vector Embeddings (pgvector extension required)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),                      -- OpenAI ada-002 dimensionality
    metadata JSONB DEFAULT '{}',                 -- {page, section, type, entities}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, chunk_index)
);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_embedding ON document_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- AI Memory/Context
CREATE TABLE conversation_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    memory_type VARCHAR(20) NOT NULL,            -- "fact", "deadline", "entity", "event"
    content TEXT NOT NULL,
    confidence FLOAT DEFAULT 1.0,                -- 0.0 to 1.0
    source_document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_conversation_memory_case_id ON conversation_memory(case_id);

-- Court Sync Jobs
CREATE TABLE court_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    sync_type VARCHAR(20) NOT NULL,              -- "webhook", "manual", "scheduled"
    status VARCHAR(20) DEFAULT 'pending',        -- "pending", "processing", "completed", "failed"
    delivery_id VARCHAR(255) UNIQUE,             -- For idempotent webhook processing
    payload JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_court_sync_jobs_case_id ON court_sync_jobs(case_id);
CREATE INDEX idx_court_sync_jobs_delivery_id ON court_sync_jobs(delivery_id);
CREATE INDEX idx_court_sync_jobs_status ON court_sync_jobs(status);

-- Chat History
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL,                   -- "user", "assistant"
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',                  -- [{document_id, chunk_id, citation}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chat_messages_case_id ON chat_messages(case_id);
```

### 2.2 Key Design Decisions

- **UUIDs for IDs**: Better for distributed systems, no auto-increment collisions
- **JSONB metadata**: Flexible schema for evolving document/chunk metadata
- **pgvector IVFFlat index**: Approximate nearest neighbor search for vector similarity
- **Delivery ID uniqueness**: Ensures idempotent webhook processing
- **Cascade deletes**: User deletion removes all associated data (GDPR compliance)

---

## 3. Module Architecture

### 3.1 Directory Structure

```
family-court-ai/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── schemas.py             # Pydantic request/response models
│   │   ├── service.py             # Business logic
│   │   ├── router.py              # API routes
│   │   └── dependencies.py        # FastAPI dependencies (get_current_user)
│   ├── cases/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   └── router.py
│   ├── court_sync/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── tyler_client.py        # Tyler Odyssey API client
│   │   ├── webhook_handlers.py    # Webhook receivers
│   │   ├── service.py
│   │   └── router.py
│   ├── documents/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── storage.py             # S3 integration
│   │   ├── service.py
│   │   └── router.py
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── embeddings.py          # OpenAI embedding client
│   │   ├── retrieval.py           # Vector search + hybrid retrieval
│   │   ├── generation.py          # LLM client (Anthropic)
│   │   ├── guardrails.py          # UPL prevention logic
│   │   ├── service.py
│   │   └── router.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Settings (Pydantic BaseSettings)
│   │   ├── database.py            # SQLAlchemy async engine
│   │   ├── security.py            # JWT, password hashing
│   │   ├── logging.py             # Structured logging setup
│   │   └── exceptions.py          # Custom exception classes
│   └── tasks/
│       ├── __init__.py
│       ├── celery_app.py          # Celery configuration
│       ├── ocr_tasks.py           # Document OCR processing
│       ├── embedding_tasks.py     # Vector embedding generation
│       └── sync_tasks.py          # Court data synchronization
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── migrations/                     # Alembic database migrations
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
├── .env.example
├── requirements.txt
├── pyproject.toml
└── README.md
```

### 3.2 Module Responsibilities

#### **`app/auth/`** - Authentication & Authorization
- User registration with email validation
- Login with JWT token generation (access + refresh tokens)
- Password reset flow (email verification)
- MFA setup and validation (TOTP via pyotp)
- JWT token refresh endpoint
- Dependency: `get_current_user()` for protected routes

#### **`app/cases/`** - Case Management
- CRUD operations for legal cases
- Case intake wizard (jurisdiction selection, case type classification)
- Case dashboard aggregation (document count, recent activity, deadlines)
- Link/unlink court system integration

#### **`app/court_sync/`** - Court API Integration
- **Tyler Odyssey Client**: OAuth2 authentication, docket retrieval, document download
- **Webhook Receiver**: HMAC-SHA256 validation, idempotent processing via delivery_id
- **Sync Service**: Orchestrate manual/scheduled syncs, queue Celery tasks
- Background job status tracking

#### **`app/documents/`** - Document Management
- Multipart file upload handling
- S3 storage integration (boto3)
- Trigger OCR Celery task on upload
- Document metadata retrieval and search
- Pre-signed URL generation for secure document access

#### **`app/rag/`** - RAG Engine
- **Embeddings**: Generate vectors via OpenAI API
- **Retrieval**: Hybrid search (vector similarity + PostgreSQL full-text search)
- **Generation**: Anthropic Claude API client with structured prompts
- **Guardrails**: Intent classification to block UPL queries, confidence thresholds
- **Memory Integration**: Inject conversation_memory into retrieval context

#### **`app/core/`** - Shared Services
- Configuration management (environment variables via Pydantic Settings)
- Database connection pooling (SQLAlchemy async engine)
- JWT encoding/decoding, password hashing (bcrypt)
- Structured logging (JSON format for production)
- Custom exceptions (APIException base class)

#### **`app/tasks/`** - Background Tasks (Celery)
- **OCR Task**: Call Google Document AI, parse response, store text in DB
- **Embedding Task**: Chunk document text, generate embeddings, store in pgvector
- **Sync Task**: Fetch court docket, download new documents, trigger OCR/embedding
- Retry logic with exponential backoff
- Task status tracking and error handling

---

## 4. Court API Integration (Tyler Odyssey)

### 4.1 Authentication Flow

Tyler Technologies uses OAuth 2.0 Client Credentials flow:

```python
# court_sync/tyler_client.py
import httpx

class TylerOdysseyClient:
    def __init__(self, client_id: str, client_secret: str, base_url: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = base_url
        self.token = None
        self.token_expires_at = None

    async def authenticate(self):
        """Get OAuth2 access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/oauth/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
            )
            response.raise_for_status()
            data = response.json()
            self.token = data["access_token"]
            self.token_expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])
```

### 4.2 Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cases/search` | POST | Search for cases by docket number, party name |
| `/api/v1/cases/{case_id}` | GET | Retrieve case details |
| `/api/v1/cases/{case_id}/docket` | GET | Get docket entries (filings, hearings) |
| `/api/v1/cases/{case_id}/documents` | GET | List documents filed in case |
| `/api/v1/documents/{doc_id}/download` | GET | Download document PDF |

### 4.3 Webhook Integration

Tyler's Configurable Integration Publishing (CIP) sends webhooks on case events:

```python
# court_sync/webhook_handlers.py
from fastapi import APIRouter, Request, HTTPException, Header
import hmac
import hashlib

router = APIRouter()

@router.post("/webhooks/tyler")
async def tyler_webhook(
    request: Request,
    x_tyler_signature: str = Header(...),
    x_tyler_delivery_id: str = Header(...),
):
    """Receive Tyler Odyssey webhook events"""

    # 1. Validate HMAC signature
    payload = await request.body()
    secret = settings.TYLER_WEBHOOK_SECRET.encode()
    expected_signature = hmac.new(secret, payload, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(x_tyler_signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # 2. Check for duplicate delivery (idempotency)
    existing_job = await db.get_sync_job_by_delivery_id(x_tyler_delivery_id)
    if existing_job:
        return {"status": "already_processed"}

    # 3. Parse payload
    event_data = await request.json()
    event_type = event_data["event_type"]  # "case.document.filed", "case.hearing.scheduled"
    case_id = event_data["case_id"]

    # 4. Queue background sync task
    from app.tasks.sync_tasks import sync_court_case
    sync_court_case.delay(case_id, delivery_id=x_tyler_delivery_id)

    # 5. Return 200 immediately (async processing)
    return {"status": "accepted"}
```

### 4.4 Sync Job Flow

```
1. Webhook received → validate signature → check idempotency → return 200
2. Celery task sync_court_case.delay(case_id, delivery_id)
3. Task: Fetch docket entries from Tyler API
4. For each new document:
   a. Download PDF from Tyler
   b. Upload to S3
   c. Create document record in DB
   d. Queue OCR task
5. Update sync job status to "completed"
```

---

## 5. Document Processing Pipeline

### 5.1 Upload Flow

```
User → POST /api/documents → Validate → Upload to S3 →
Create DB record → Queue OCR task → Return document_id
```

### 5.2 OCR Task (Google Document AI)

```python
# tasks/ocr_tasks.py
from celery import shared_task
from google.cloud import documentai_v1 as documentai

@shared_task(bind=True, max_retries=3)
def process_document_ocr(self, document_id: str):
    """Extract text from document using Google Document AI"""

    try:
        # 1. Fetch document from DB
        document = await db.get_document(document_id)

        # 2. Download from S3
        s3_client = boto3.client('s3')
        file_content = s3_client.get_object(
            Bucket=settings.S3_BUCKET,
            Key=document.storage_url
        )['Body'].read()

        # 3. Call Google Document AI
        client = documentai.DocumentProcessorServiceClient()
        request = documentai.ProcessRequest(
            name=settings.DOCUMENT_AI_PROCESSOR_NAME,
            raw_document=documentai.RawDocument(
                content=file_content,
                mime_type=document.file_type
            )
        )
        result = client.process_document(request=request)

        # 4. Extract text and entities
        parsed_text = result.document.text
        entities = extract_legal_entities(result.document)  # dates, parties, amounts

        # 5. Update document record
        await db.update_document(
            document_id,
            ocr_status="completed",
            parsed_text=parsed_text,
            metadata={"entities": entities, "page_count": len(result.document.pages)}
        )

        # 6. Queue embedding task
        from app.tasks.embedding_tasks import generate_embeddings
        generate_embeddings.delay(document_id)

    except Exception as e:
        await db.update_document(document_id, ocr_status="failed")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
```

### 5.3 Chunking Strategy

- **Method**: Semantic chunking (preserve sentence boundaries)
- **Chunk size**: 500 tokens (~400 words)
- **Overlap**: 100 tokens (prevent context loss at boundaries)
- **Library**: LangChain's `RecursiveCharacterTextSplitter`

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    separators=["\n\n", "\n", ". ", " ", ""]
)
chunks = splitter.split_text(parsed_text)
```

### 5.4 Embedding Generation

```python
# tasks/embedding_tasks.py
@shared_task
async def generate_embeddings(document_id: str):
    """Generate vector embeddings for document chunks"""

    document = await db.get_document(document_id)
    chunks = chunk_text(document.parsed_text)

    # Batch embed with OpenAI
    openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
    embeddings = []

    for i, chunk in enumerate(chunks):
        response = await openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=chunk
        )
        embedding = response.data[0].embedding

        await db.create_document_chunk(
            document_id=document_id,
            chunk_index=i,
            chunk_text=chunk,
            embedding=embedding,
            metadata={"page": estimate_page_number(i, len(chunks))}
        )
```

---

## 6. RAG Implementation

### 6.1 Retrieval Pipeline

```python
# rag/retrieval.py
async def retrieve_context(query: str, case_id: str, top_k: int = 5):
    """Hybrid retrieval: vector similarity + keyword search"""

    # 1. Generate query embedding
    query_embedding = await generate_embedding(query)

    # 2. Vector similarity search (pgvector)
    vector_results = await db.execute("""
        SELECT dc.chunk_text, dc.metadata, d.file_name,
               1 - (dc.embedding <=> :query_embedding) AS similarity
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE d.case_id = :case_id
        ORDER BY dc.embedding <=> :query_embedding
        LIMIT :top_k
    """, {"query_embedding": query_embedding, "case_id": case_id, "top_k": top_k})

    # 3. Keyword search (PostgreSQL full-text search)
    keyword_results = await db.execute("""
        SELECT dc.chunk_text, dc.metadata, d.file_name,
               ts_rank(to_tsvector('english', dc.chunk_text), query) AS rank
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id,
             plainto_tsquery('english', :query) query
        WHERE d.case_id = :case_id
          AND to_tsvector('english', dc.chunk_text) @@ query
        ORDER BY rank DESC
        LIMIT :top_k
    """, {"query": query, "case_id": case_id, "top_k": top_k})

    # 4. Merge and deduplicate results
    combined_results = merge_and_rerank(vector_results, keyword_results)

    # 5. Include conversation memory
    memory_facts = await db.get_conversation_memory(case_id)

    return {
        "retrieved_chunks": combined_results[:top_k],
        "memory_context": memory_facts
    }
```

### 6.2 Prompt Engineering

```python
# rag/generation.py
SYSTEM_PROMPT = """You are a procedural navigation assistant for family court litigants in {jurisdiction}.

**STRICT GUIDELINES:**
1. You provide ONLY procedural information, deadlines, form requirements, and court logistics.
2. You NEVER provide legal advice, predict outcomes, or recommend specific legal strategies.
3. You MUST cite your sources using [Document: filename, Page: X] format.
4. If the answer is not in the provided context, say "I don't have that information in your documents. You should contact the {court_name} clerk at {phone}."
5. All responses must be in plain language, avoiding legalese when possible.

**PROHIBITED:**
- "You should argue..." or "Your best strategy is..."
- Predicting judge decisions or case outcomes
- Advising on asset concealment or procedural manipulation
- Drafting legal arguments or motions

**CONTEXT:**
{retrieved_chunks}

**USER FACTS (from previous conversations):**
{memory_context}

**USER QUESTION:**
{user_query}

Provide a helpful, accurate procedural answer with citations."""

async def generate_response(query: str, case_id: str):
    """Generate RAG response with guardrails"""

    # 1. Check for UPL intent
    if is_upl_query(query):
        return {
            "answer": "I cannot provide legal advice or strategy recommendations. I can only help with procedural questions like filing deadlines, required forms, and court contact information. Would you like help with something procedural?",
            "blocked": True
        }

    # 2. Retrieve context
    context = await retrieve_context(query, case_id)

    # 3. Get case details for prompt
    case = await db.get_case(case_id)
    jurisdiction = f"{case.jurisdiction_county}, {case.jurisdiction_state}"

    # 4. Format prompt
    prompt = SYSTEM_PROMPT.format(
        jurisdiction=jurisdiction,
        court_name=f"{case.jurisdiction_county} Superior Court",
        phone="(619) 450-5700",  # San Diego example
        retrieved_chunks=format_chunks(context["retrieved_chunks"]),
        memory_context=format_memory(context["memory_context"]),
        user_query=query
    )

    # 5. Call LLM
    anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = await anthropic_client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    # 6. Extract citations
    answer = response.content[0].text
    citations = extract_citations(answer)

    # 7. Store in chat history
    await db.create_chat_message(case_id, "user", query)
    await db.create_chat_message(case_id, "assistant", answer, sources=citations)

    return {"answer": answer, "citations": citations}
```

### 6.3 UPL Guardrails

```python
# rag/guardrails.py
UPL_KEYWORDS = [
    "should i accept", "best strategy", "how to win", "hide assets",
    "what will the judge", "chances of winning", "legal advice"
]

def is_upl_query(query: str) -> bool:
    """Detect queries requesting legal advice"""
    query_lower = query.lower()

    # Keyword matching
    if any(keyword in query_lower for keyword in UPL_KEYWORDS):
        return True

    # Pattern matching (regex)
    upl_patterns = [
        r"should i (accept|reject|agree)",
        r"what (are my chances|will happen if)",
        r"how (can i win|do i beat)"
    ]
    if any(re.search(pattern, query_lower) for pattern in upl_patterns):
        return True

    # ML-based intent classification (future enhancement)
    # intent = classify_intent(query)
    # if intent == "legal_advice":
    #     return True

    return False
```

---

## 7. API Design

### 7.1 Authentication Endpoints

```
POST /api/auth/register
  Request: {email, password}
  Response: {user_id, email}

POST /api/auth/login
  Request: {email, password}
  Response: {access_token, refresh_token, expires_in}

POST /api/auth/refresh
  Request: {refresh_token}
  Response: {access_token, expires_in}

POST /api/auth/logout
  Request: {refresh_token}
  Response: {message: "Logged out"}
```

### 7.2 Case Management Endpoints

```
GET /api/cases
  Headers: Authorization: Bearer {token}
  Response: [{id, case_type, docket_number, status, created_at}]

POST /api/cases
  Headers: Authorization: Bearer {token}
  Request: {
    jurisdiction_state: "CA",
    jurisdiction_county: "San Diego",
    case_type: "divorce",
    docket_number: "D-12345"
  }
  Response: {id, ...case_details}

GET /api/cases/{case_id}
  Response: {id, user_id, jurisdiction, documents_count, last_sync}

PATCH /api/cases/{case_id}
  Request: {status: "closed"} or {docket_number: "updated"}
  Response: {id, ...updated_fields}

POST /api/cases/{case_id}/sync
  Response: {job_id, status: "queued"}
```

### 7.3 Document Endpoints

```
POST /api/cases/{case_id}/documents
  Headers: Content-Type: multipart/form-data
  Request: FormData(file: File)
  Response: {id, file_name, ocr_status, uploaded_at}

GET /api/cases/{case_id}/documents
  Response: [{id, file_name, file_size, uploaded_at, ocr_status}]

GET /api/documents/{document_id}
  Response: {id, file_name, parsed_text, metadata}

GET /api/documents/{document_id}/download
  Response: Redirect to S3 pre-signed URL
```

### 7.4 RAG/Chat Endpoints

```
POST /api/chat
  Request: {case_id, query: "What is the deadline for filing response?"}
  Response: {
    answer: "Based on your summons...",
    citations: [{document_id, file_name, page}],
    blocked: false
  }

GET /api/chat/history/{case_id}
  Response: [{id, role, content, created_at}]
```

### 7.5 Webhook Endpoints (Public)

```
POST /api/webhooks/tyler
  Headers: X-Tyler-Signature, X-Tyler-Delivery-ID
  Request: {event_type, case_id, payload}
  Response: {status: "accepted"}
```

---

## 8. Security & Compliance

### 8.1 Authentication & Authorization

- **Password Requirements**: Minimum 12 characters, complexity rules enforced
- **Password Hashing**: bcrypt with cost factor 12
- **JWT Tokens**:
  - Access token: 15 minutes expiration
  - Refresh token: 7 days expiration
  - Signed with HS256 algorithm
- **MFA**: TOTP (Time-based One-Time Password) via pyotp library
- **Rate Limiting**: 100 requests/minute per user (via slowapi)

### 8.2 Data Security

- **Encryption at Rest**: AES-256 for S3 objects, PostgreSQL TDE (optional)
- **Encryption in Transit**: TLS 1.3 for all API communication
- **Database Access**: Connection via SSL, rotate credentials monthly
- **API Keys**: Store in environment variables, never commit to git
- **CORS**: Restrict origins to production frontend domain

### 8.3 Privacy & Compliance (Foundation)

- **Data Minimization**: Collect only necessary user information
- **Right to Delete**: Endpoint to purge all user data (CCPA compliance)
- **Audit Logging**: Log all authentication attempts, document access
- **LLM Zero-Retention**: Use Anthropic's zero-retention API tier
- **No Training Data**: User content never used to train models

### 8.4 Error Handling

- **Never Expose Stack Traces**: Return generic "Internal Server Error" to users
- **Structured Logging**: Log full errors with context (user_id, case_id, timestamp)
- **Sentry Integration**: Track and alert on production errors

---

## 9. Testing Strategy

### 9.1 Unit Tests (pytest)

- Test all service layer business logic
- Mock external dependencies (S3, OpenAI, Anthropic, Tyler API)
- Target: 80% code coverage

```python
# tests/unit/test_rag_retrieval.py
@pytest.mark.asyncio
async def test_retrieve_context_returns_top_k_chunks():
    mock_db = Mock()
    mock_db.execute.return_value = [
        {"chunk_text": "Filing deadline is 30 days", "similarity": 0.95}
    ]

    results = await retrieve_context("When is the deadline?", case_id="123", top_k=5)
    assert len(results["retrieved_chunks"]) <= 5
```

### 9.2 Integration Tests

- Test API endpoints with test database
- Use pytest fixtures for database setup/teardown
- Test authentication flow end-to-end

```python
# tests/integration/test_auth_api.py
def test_register_login_flow(client, test_db):
    # Register
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "SecurePass123!"
    })
    assert response.status_code == 201

    # Login
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "SecurePass123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

### 9.3 E2E Tests

- Test complete workflows (upload document → OCR → embedding → RAG query)
- Mock Tyler API with sample responses
- Use Docker Compose for isolated test environment

### 9.4 Load Testing (locust)

- Baseline performance targets:
  - `/api/chat`: < 2 seconds TTFT (Time to First Token)
  - `/api/documents`: < 500ms for upload initiation
  - Support 100 concurrent users

---

## 10. Deployment & Infrastructure

### 10.1 Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Run FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/family_court
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  db:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: family_court
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  celery_worker:
    build: .
    command: celery -A app.tasks.celery_app worker --loglevel=info
    depends_on:
      - redis
      - db

volumes:
  postgres_data:
```

### 10.2 Environment Variables

```bash
# .env.example
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/family_court

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET=family-court-documents
S3_REGION=us-west-1

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google Document AI
GOOGLE_CLOUD_PROJECT=your-project
DOCUMENT_AI_PROCESSOR_NAME=projects/.../processors/...

# Tyler Odyssey API
TYLER_CLIENT_ID=your-client-id
TYLER_CLIENT_SECRET=your-client-secret
TYLER_BASE_URL=https://api.tylertech.com
TYLER_WEBHOOK_SECRET=your-webhook-secret

# App Settings
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,https://app.example.com
```

### 10.3 Deployment Options (MVP)

**Recommended: Railway / Render / Fly.io**
- Pros: Simple, auto-scaling, managed PostgreSQL
- Cons: Higher cost at scale
- Time: 1-2 hours setup

**Alternative: AWS ECS / Fargate**
- Pros: Full control, cost-effective at scale
- Cons: More complex setup
- Time: 1-2 days setup

### 10.4 Monitoring & Observability

- **Application Logs**: Structured JSON logs → CloudWatch / Datadog
- **Error Tracking**: Sentry for exception monitoring
- **Performance Monitoring**: New Relic / Datadog APM
- **Uptime Monitoring**: UptimeRobot / Pingdom
- **Database Monitoring**: PgHero / AWS RDS Performance Insights

---

## 11. MVP Implementation Timeline

### Week 1-2: Foundation
- [ ] Project scaffolding (FastAPI, SQLAlchemy, Alembic)
- [ ] Database schema implementation + migrations
- [ ] Auth module (register, login, JWT)
- [ ] Docker Compose local development environment

### Week 3-4: Document Processing
- [ ] S3 integration for file storage
- [ ] Document upload endpoints
- [ ] Google Document AI OCR integration
- [ ] Celery tasks for OCR processing
- [ ] Chunking and embedding pipeline

### Week 5-6: Court API Integration
- [ ] Tyler Odyssey API client
- [ ] OAuth2 authentication
- [ ] Docket sync implementation
- [ ] Webhook receiver with HMAC validation
- [ ] Idempotent processing logic

### Week 7-8: RAG Implementation
- [ ] pgvector setup and indexing
- [ ] Hybrid retrieval (vector + keyword search)
- [ ] Anthropic Claude integration
- [ ] Prompt engineering and UPL guardrails
- [ ] Chat history and memory integration

### Week 9-10: Testing & Deployment
- [ ] Unit tests (80% coverage)
- [ ] Integration tests for API endpoints
- [ ] E2E test for document → OCR → RAG flow
- [ ] Production deployment (Railway/Render)
- [ ] Monitoring and error tracking setup

### Week 11-12: Polish & Launch Prep
- [ ] Rate limiting and security hardening
- [ ] Performance optimization (query tuning, caching)
- [ ] Documentation (API docs, deployment guide)
- [ ] Beta user testing with 10 users
- [ ] Bug fixes and refinements

**Total: 12 weeks to functional MVP**

---

## 12. Future Enhancements (Post-MVP)

1. **Phase 2 Court Expansion**
   - Journal Technologies eCourt API (Los Angeles)
   - Statewide California coverage (58 counties)
   - PACER integration for federal court cases

2. **Mobile Applications**
   - React Native app (iOS + Android)
   - Document camera with boundary detection
   - Push notifications for deadlines

3. **Advanced AI Features**
   - Fine-tuned LLM on family court case law
   - Automated form filling (pre-populate FL-series forms)
   - Predictive deadline calendars

4. **Compliance Certifications**
   - SOC 2 Type II audit
   - HIPAA Business Associate Agreement
   - State bar ethics review and approval

5. **Nationwide Expansion**
   - Tyler Odyssey integration (22 states, 600+ counties)
   - Juriscraper fallback for non-API courts
   - Multi-state jurisdictional knowledge base

---

## 13. Success Criteria

### Technical Metrics
- [ ] RAG retrieval precision > 95%
- [ ] OCR extraction fidelity > 98%
- [ ] API response time < 2 seconds (TTFT)
- [ ] System uptime > 99.5%
- [ ] Zero security incidents

### User Metrics
- [ ] 100 active beta users
- [ ] 80%+ task completion rate (users successfully find forms, deadlines)
- [ ] < 5% UPL guardrail false positive rate
- [ ] Sustained weekly active users (case spans months)

### Business Metrics
- [ ] Court sync success rate > 95%
- [ ] Document processing success rate > 98%
- [ ] Positive user feedback (NPS > 50)

---

## Conclusion

This design provides a comprehensive blueprint for a production-ready MVP of the AI-Powered Family Court Navigation Assistant. The modular monolith architecture balances rapid development with future scalability, while strict UPL guardrails and security measures ensure ethical and compliant operation.

The Tyler Odyssey integration delivers immediate value through real-time court data synchronization, and the RAG architecture grounds all AI responses in user-specific documents and jurisdiction-specific procedural rules. By following this design, the engineering team can deliver a functional MVP in 12 weeks that fundamentally improves the pro se litigant experience.
