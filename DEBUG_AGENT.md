# 🐛 DEBUG AGENT MODE - Chat Tidak Muncul

## Langkah-langkah Debug:

### 1. Jalankan App
```bash
npm run dev
```

### 2. Test Flow:
1. Buka Agent Mode (⚡ button)
2. Pilih 2-3 models (centang)
3. Klik "New" (create session)
4. Chat 2-3 kali:
   - "Hello"
   - "How are you?"
   - "Tell me a joke"

### 3. Cek Console Logs:
Setelah setiap chat, cek browser console (F12):

**Yang HARUS muncul:**
```
💾 Saving agent response: {
  sessionId: "agent-xxx",
  turnId: "turn-xxx",
  responses: 3,
  hasContent: true  <-- HARUS true!
}
✓ Agent response saved successfully
✓ Session updated
```

**Jika hasContent: false** = Masalah di collect responses
**Jika tidak ada log** = Masalah di save function

### 4. Test Load:
1. Tutup Agent Mode
2. Buka lagi
3. Klik "Sessions"
4. Pilih session

**Cek console:**
```
📂 Loading session: agent-xxx
📊 Loaded responses: {
  sessionId: "agent-xxx",
  count: 3,
  responses: [
    { userMsg: "Hello", responsesCount: 3, hasContent: true },
    ...
  ]
}
✓ Setting conversation with 3 turns
```

### 5. Test IndexedDB Langsung:
Buka DevTools → Application → IndexedDB → ChatBotDB:

**Cek Tables:**
- `agentSessions` - Harus ada sessions
- `agentResponses` - Harus ada responses dengan content

**Jika KOSONG:**
= Data tidak tersimpan!

### 6. Debug Button (Development Only):
Di Agent Mode ada button 🐛, klik untuk:
- See all sessions in console
- Check responses data
- Verify content exists

## Common Issues:

### Issue 1: hasContent: false
**Penyebab:** finalResponsesMap tidak ter-update
**Fix:** Pastikan di onComplete callback ada:
```typescript
finalResponsesMap.set(index, {
    provider: model.provider,
    modelId: model.modelId,
    modelName: model.modelName,
    content,  // <-- Harus ada value!
    isLoading: false,
    metadata,
});
```

### Issue 2: Tidak ada log "Saving"
**Penyebab:** Save function tidak terpanggil
**Fix:** Cek apakah:
- currentSessionId ada value
- finalResponsesMap.size > 0
- await Promise.all(promises) selesai

### Issue 3: Data load tapi conversation kosong
**Penyebab:** conversationHistory tidak di-set
**Fix:** Cek mapping dari AgentResponse ke ConversationTurn

## Quick Fix Commands:

### Clear All Data (Start Fresh):
```javascript
// Di browser console:
await chatDB.clearAllData();
console.log('✓ All data cleared');
```

### Manual Test Save:
```javascript
// Di browser console:
const testResponse = {
    id: 'test-1',
    sessionId: 'test-session',
    userMessage: 'Test',
    timestamp: Date.now(),
    responses: [
        {
            provider: 'poe',
            modelId: 'GPT-5-mini',
            modelName: 'GPT-5-mini',
            content: 'Test response',
            metadata: {}
        }
    ]
};
await chatDB.addAgentResponse(testResponse);
console.log('✓ Test data saved');

// Then load:
const loaded = await chatDB.getAgentResponsesBySession('test-session');
console.log('Loaded:', loaded);
```

## Next Steps:

1. Run `npm run dev`
2. Open browser console (F12)
3. Follow test flow
4. Check ALL logs
5. Report what you see!

**Logs akan kasih tahu exactly where the problem is!**
