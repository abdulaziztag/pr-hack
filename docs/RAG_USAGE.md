# Mini-RAG System Usage Guide

## Overview

The Mini-RAG (Retrieval Augmented Generation) system provides grounded, cited answers in the Offers Chat by retrieving relevant snippets from a local corpus of tariffs, policies, and documentation.

## Quick Start

### For Users

Ask questions about fees, policies, APR, or P2P in the chat. The assistant will provide cited answers with superscript references like [bank] that you can hover or click.

**Example queries:**

- "Explain the transfer fee for card disbursement"
- "What is APR and how is it calculated?"
- "How does P2P escrow work?"
- "What are the eligibility requirements?"

### For Developers

#### Adding New Documents

Edit `src/lib/rag/corpus.ts` and add to the `CORPUS` array:

```typescript
{
  id: "your_doc_id_v1",           // Unique, stable ID
  title: "Human-Readable Title",   // Shown in tooltips
  source: "Demo Tariff",           // Source category
  url: "/docs/fees#section",       // Optional link
  text: `Your document content...` // Plain text, 2-4 KB max
}
```

#### Enabling RAG for a New Intent

In `src/components/chat/ChatDock.tsx`, add the intent to the `ragIntents` array:

```typescript
const ragIntents = [
  "explain_apr",
  "fee_explain",
  // ... existing intents
  "your_new_intent", // Add here
]
```

#### Citing in Responses

The assistant is instructed to cite sources using:

```
[^docId]
```

Example response:

```
Transfer fees typically range from 3-5% [^bank_transfer_fee_v1].
```

This renders as: Transfer fees typically range from 3-5% <sup>[bank]</sup>

## Architecture

### Components

1. **Corpus** (`src/lib/rag/corpus.ts`): 10 seed documents
2. **Tokenizer** (`src/lib/rag/tokenize.ts`): Unicode-aware, filters stopwords
3. **BM25 Index** (`src/lib/rag/bm25.ts`): In-memory search index
4. **RAG Service** (`src/lib/ai/rag-service.ts`): High-level retrieval API
5. **Citation Renderer** (`src/components/chat/InlineCitations.tsx`): Parses `[^id]` markers

### Flow

```
User Query
    ↓
Intent Router → Detect if RAG-enabled intent
    ↓
retrieveSnippets(query, k=3)
    ↓
Tokenize → BM25 Rank → Extract Snippets
    ↓
Inject RAG_SNIPPETS into system message
    ↓
OpenAI API → Assistant response with citations
    ↓
InlineCitations component → Render superscripts
```

### System Message Format

```
INTENT=fee_explain CONF=0.92
SLOTS={"feeName":"transfer"}
SNAPSHOT={...}
TOOLS=[...]
RAG_SNIPPETS=[
  {
    "id": "bank_transfer_fee_v1",
    "title": "Bank Microloan: Card Transfer Fee",
    "source": "Demo Tariff",
    "url": "/docs/fees#transfer",
    "snippet": "transfer fee charged when moving funds...",
    "score": 3.421
  }
]

Use the snippets as ground truth. Cite inline using [^docId].
```

## API Reference

### `retrieveSnippets(query: string, k?: number): RagSnippet[]`

Retrieve top-k snippets for a query.

**Parameters:**

- `query` - Natural language query string
- `k` - Max number of results (default: 3)

**Returns:**

```typescript
interface RagSnippet {
  id: string // Document ID
  title: string // Human-readable title
  source: string // Source category
  url?: string // Optional link
  snippet: string // Extracted snippet (~40 tokens)
  score: number // BM25 relevance score
}
```

**Example:**

```typescript
import { retrieveSnippets } from "@/lib/ai/rag-service"

const snippets = retrieveSnippets("transfer fee", 3)
console.log(snippets[0].title) // "Bank Microloan: Card Transfer Fee"
```

### `InlineCitations` Component

Renders text with inline citation markers.

**Props:**

- `text: string` - Text containing `[^docId]` markers

**Example:**

```tsx
import InlineCitations from "@/components/chat/InlineCitations"
;<InlineCitations text="Transfer fee applies [^bank_transfer_fee_v1]." />
```

**Output:**

```html
Transfer fee applies
<a href="/docs/fees#transfer" title="..."> <sup>[bank]</sup> </a>.
```

## Testing

### Run RAG Tests

```bash
npm test -- --testPathPattern="rag"
```

### Test Coverage

- **22 unit tests**: Tokenization, indexing, search
- **13 service tests**: `retrieveSnippets` API
- **5 integration tests**: ChatDock RAG injection
- **13 render tests**: Citation parsing & rendering

**Total: 53 tests, all passing**

## Extending the System

### Add a New Document Type

1. Create JSON files in `src/data/terms/` (optional, for reference)
2. Add entries to `src/lib/rag/corpus.ts`
3. Documents auto-indexed on import

### Improve Search

- Adjust BM25 parameters in `src/lib/rag/bm25.ts`:
  - `k1`: Term saturation (default: 1.5)
  - `b`: Length normalization (default: 0.75)
- Tune snippet window size (default: 40 tokens)

### Add Stopwords

Edit `src/lib/rag/tokenize.ts` to filter common words:

```typescript
const STOPWORDS = new Set(["the", "a", "an", "and", "or", ...])
// Filter in tokenize() function
```

## Best Practices

### Document Guidelines

- **Length**: 500-2000 words per document
- **Structure**: Plain text, no markdown/HTML
- **Topics**: One clear topic per document
- **IDs**: Use stable, versioned IDs (`doc_name_v1`)

### Citation Style

- **Inline only**: Use `[^id]` within sentences
- **Multiple cites**: OK to cite multiple sources
- **Context**: Cite closest to claim, not at end of paragraph

### Performance

- **Index build**: < 10ms for 10 docs
- **Query latency**: < 1ms per query
- **Memory**: ~100 KB for 10 docs + index

## Troubleshooting

### No snippets returned

- Check query length (min 2 chars)
- Verify intent in `ragIntents` list
- Try broader search terms

### Citations not rendering

- Verify `[^id]` format (lowercase, underscores)
- Check `InlineCitations` wrapper in ChatDock
- Ensure doc ID exists in corpus

### Poor relevance

- Add more query terms
- Check tokenization (special chars stripped)
- Consider adding synonyms to corpus

## Future Enhancements

- [ ] Add more corpus documents (target: 50-100)
- [ ] Implement semantic search (embeddings)
- [ ] Add snippet highlighting in UI
- [ ] Support multi-language queries
- [ ] Add citation metrics (usage tracking)

## License & Demo Notice

This is a simulation-only system. No real funds, no external APIs. All corpus content is demo data for educational purposes.
