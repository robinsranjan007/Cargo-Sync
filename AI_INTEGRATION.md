# CargoSync — AI Document Processing Integration

## Overview

CargoSync uses Google Gemini AI to automatically extract structured data from freight documents (Bills of Lading, Proof of Delivery, Rate Confirmations). This eliminates manual data entry for dispatchers — a process that previously took 10+ minutes per document now takes under 10 seconds.

---

## How It Works

### The Clever Trick — OpenAI-Compatible Gemini Endpoint

Google provides an OpenAI-compatible API endpoint for Gemini models. This means we use the standard OpenAI JavaScript client library but redirect it to Google's servers.

```
Normal OpenAI:  client → https://api.openai.com
Our setup:      client → https://generativelanguage.googleapis.com/v1beta/openai/
```

Same code, different destination. This gives us:
- Familiar OpenAI SDK syntax
- Gemini's powerful vision capabilities
- Google's free tier quota
- Easy swap to real OpenAI in production

### Configuration

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
GEMINI_MODEL=gemini-2.5-flash
```

```javascript
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.GEMINI_BASE_URL
});
```

---

## Full Pipeline

```
Dispatcher uploads BOL image (Postman / Frontend)
              ↓
Multer middleware receives file in memory (no disk write)
              ↓
File uploaded to AWS S3 (ca-central-1)
Key format: {tenantId}/{loadId}/{docType}_{timestamp}_{filename}
              ↓
Image converted to base64 string
              ↓
Sent to Gemini API with structured extraction prompt
              ↓
AI returns JSON with extracted freight fields
              ↓
JSON parsed and validated
              ↓
Kafka event published → topic: document.processed
              ↓
Response returned to client with S3 URL + extracted data
```

---

## Extracted Fields

```json
{
  "shipperName": "Ontario Auto Parts Ltd",
  "consigneeName": "Pacific Distribution Inc",
  "pickupCity": "Toronto",
  "deliveryCity": "Vancouver",
  "commodity": "Automotive parts",
  "weight": "18400",
  "proNumber": "PRO-2024-88234",
  "signaturePresent": true
}
```

---

## The Prompt Engineering

We use a structured extraction prompt that:
1. Defines the AI's role — "You are a freight document parser"
2. Specifies exact JSON keys to return
3. Instructs it to return null for missing fields
4. Demands ONLY JSON output — no explanatory text

```javascript
`You are a freight document parser. Extract fields from this 
document and return ONLY a JSON object:
{
  "shipperName": "",
  "consigneeName": "",
  ...
}
If not found use null. Return ONLY JSON.`
```

---

## Why This Design

### Why async processing?
Document extraction takes 2-8 seconds. We don't make the user wait — the upload returns immediately, processing happens in the background, and a Kafka event notifies other services when complete.

### Why S3 before AI extraction?
We store the original document permanently regardless of AI success or failure. If AI extraction fails, a human can still access the original document and manually enter data.

### Why Kafka after extraction?
The Load Service needs to know when a document is processed so it can auto-populate load fields. Instead of directly calling Load Service (tight coupling), we publish a `document.processed` event. Any service that cares about document processing subscribes independently.

### Why base64 instead of S3 URL?
Gemini API requires the image data to be sent directly in the request as base64. We can't just pass an S3 URL because S3 is private — Gemini's servers can't access it without authentication.

---

## Swapping AI Providers

The beauty of this design — swapping AI providers requires changing only 3 lines:

**Switch to real OpenAI:**
```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
  // remove baseURL — defaults to OpenAI
});
// change model to: 'gpt-4o'
```

**Switch to Anthropic Claude:**
```javascript
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// adjust API call syntax slightly
```

The rest of the pipeline — S3, Kafka, response format — stays identical.

---

## Files

```
services/documents/
├── controllers/
│   └── documentController.js   ← Main logic, AI call, S3 upload
├── routes/
│   └── documentRoutes.js       ← POST /upload, GET /presigned/:key
├── config/
│   ├── s3.js                   ← AWS S3 client
│   └── kafka.js                ← Kafka producer
└── middleware/
    └── auth.js                 ← JWT verification
```

---

## Testing

Upload any document image via Postman:

```
POST http://localhost:3005/api/documents/upload
Authorization: Bearer {jwt_token}
Body: form-data
  - document: [image file]
  - loadId: {load_id}
  - documentType: BOL
```

For best results upload an actual Bill of Lading or any document with text. A screenshot of a desktop will return null values — correct behavior since no freight data exists in that image.

---

*Built with Node.js · AWS S3 · Google Gemini AI · Apache Kafka*