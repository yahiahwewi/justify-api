# Justify API

A professional REST API that justifies text to a fixed width of 80 characters per line, featuring daily word-count rate limiting and token-based authentication.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Testing & Coverage
```bash
npm test
npm run test:coverage
```

### 🌐 Deployment
The API is configured for automatic deployment on **Render** via the included `render.yaml` Blueprint.

**Deploy Status:** [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yahiahwewi/justify-api)

**Public URL:** [https://justify-api-yahiahwewi.onrender.com](https://justify-api-yahiahwewi.onrender.com) (Live after setup)

---

## 🛠 API Usage

### 1. Get Authentication Token
Request a unique token using your email. This token is required for the justification service.

**Endpoint:** `POST /api/token`  
**Body (JSON):**
```json
{
  "email": "developer@example.com"
}
```

### 2. Justify Text
Justify your text to exactly 80 characters per line.

**Endpoint:** `POST /api/justify`  
**Headers:**
- `Content-Type: text/plain`
- `Authorization: Bearer <your_token>`

**Body:** (Raw text content)

**Rules:**
- Lines are justified using even space distribution.
- The last line of each paragraph remains left-aligned.
- Daily limit: **80,000 words** per token.

---

## 🧠 Core Algorithm: The Justification Logic

The justification process is implemented manually (no external libraries) to ensure precise control over typographic alignment.

### How it works:
1. **Paragraph Identification:** The text is split into paragraphs while preserving user intent.
2. **Greedy Line Breaking:** Words are packed into lines of maximum 80 characters.
3. **Space Distribution:** 
   - For standard lines, the algorithm calculates the exact number of spaces needed to reach 80 chars. 
   - These spaces are distributed as evenly as possible between words.
   - Any "extra" spaces that don't divide perfectly are distributed from **left to right** to maintain a natural visual flow.
4. **Boundary Handling:** The last line of a paragraph is intentionally left-aligned (joined with single spaces) to follow standard typesetting conventions.

---

## 🏗 Design Decisions

### 1. Centralized Error Handling
We use a specialized middleware to intercept all errors. This guarantees that whether it's a `401 Unauthorized`, a `402 Payment Required` (rate limit), or a `400 Bad Request`, the client always receives a predictable JSON response structure.

### 2. Middleware Chain
The processing flow is strictly ordered for efficiency:
1. **Authentication:** Validates the token first.
2. **Rate Limiting:** Calculated next to avoid wasting resources on over-quota requests.
3. **Justification:** The heavy computation only runs if both previous checks pass.

### 3. In-Memory Storage
For this version, tokens and word usage are stored in-memory using `Map` objects. This provides O(1) lookup times but means data resets if the server restarts. In a production environment, this would be swapped for a persistent store like Redis.

---

## 📊 Reliability
The project maintains a high test coverage across:
- **Unit Tests:** Deeply validating the space distribution and paragraph logic.
- **Integration Tests:** Ensuring the multi-middleware flow works end-to-end.
- **Edge Cases:** Handling empty strings, words longer than 80 chars, and boundary date resets for the rate limiter.
