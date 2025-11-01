# 🐛 Debug Mode Configuration

## Cara Mengatur Debug Mode

Debug mode bisa diatur via environment variable `VITE_DEBUG_MODE` di file `.env`

### 1. Edit File `.env`

```bash
# Copy dari .env.example jika belum ada
cp .env.example .env

# Edit .env
nano .env  # atau vim, code, dll
```

### 2. Set Debug Mode

**Enable Debug (Development):**
```env
VITE_DEBUG_MODE=true
```

**Disable Debug (Production):**
```env
VITE_DEBUG_MODE=false
```

### 3. Restart Dev Server

**PENTING!** Setelah ubah `.env`, HARUS restart server:

```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

## Apa yang Dikontrol Debug Mode?

### Debug Mode = TRUE (Development)

✅ **Console Logs:**
- ⚡ Session creation logs
- 🚀 Message send logs
- ✓ Response collection logs
- 💾 Database save logs
- 📂 Session load logs
- 📊 Data verification logs

✅ **Debug Button (🐛):**
- Button 🐛 muncul di Agent Mode header
- Click untuk inspect database
- Shows all sessions & responses
- Verify data integrity

✅ **Error Details:**
- Full error stack traces
- Warning messages
- Debug information

### Debug Mode = FALSE (Production)

❌ **No Console Logs:**
- Semua debug logs disabled
- Console tetap bersih
- Only critical errors shown

❌ **No Debug Button:**
- Button 🐛 hilang
- Clean UI for end users
- No debug clutter

✅ **Still Works:**
- All functionality normal
- Data save/load works
- Just no debug output

## Quick Examples

### Example 1: Development Setup
```env
# .env for development
VITE_POE_API_KEY=pk-xxx
VITE_TOGETHER_API_KEY=xxx
VITE_GROQ_API_KEY=gsk-xxx
VITE_DEBUG_MODE=true  # <-- Enable debug
```

**Result:**
```
⚡ No session, creating new one...
✓ Session created: agent-1234
🚀 Starting message send: {...}
✓ Collected response 1/3: {...}
💾 Saving agent response: {...}
```

### Example 2: Production Setup
```env
# .env for production
VITE_POE_API_KEY=pk-xxx
VITE_TOGETHER_API_KEY=xxx
VITE_GROQ_API_KEY=gsk-xxx
VITE_DEBUG_MODE=false  # <-- Disable debug
```

**Result:**
```
(no logs - clean console)
```

## Testing Debug Mode

### Test Enable:
```bash
# Set debug to true
echo "VITE_DEBUG_MODE=true" >> .env

# Restart
npm run dev

# Test - should see logs
# Open Agent Mode → Chat
# Check console (F12) → Logs muncul ✓
```

### Test Disable:
```bash
# Set debug to false
sed -i 's/VITE_DEBUG_MODE=true/VITE_DEBUG_MODE=false/' .env

# Restart
npm run dev

# Test - should NOT see logs
# Open Agent Mode → Chat
# Check console (F12) → No debug logs ✓
```

## Checking Current Mode

Buka browser console dan ketik:

```javascript
import.meta.env.VITE_DEBUG_MODE
// Returns: "true" or "false"
```

Atau lihat debug button:
- Ada button 🐛 = Debug ON
- Tidak ada = Debug OFF

## Tips

1. **Development:** Always use `VITE_DEBUG_MODE=true`
   - Helps troubleshoot issues
   - See what's happening
   - Verify data flow

2. **Production:** Always use `VITE_DEBUG_MODE=false`
   - Clean user experience
   - No clutter in console
   - Professional appearance

3. **When Debugging Issues:**
   - Enable debug mode
   - Reproduce the issue
   - Check console logs
   - Fix based on logs
   - Disable debug when done

4. **Remember to Restart:**
   - Vite reads .env on startup
   - Changes need server restart
   - `Ctrl+C` then `npm run dev`

## Environment Variables Hierarchy

```
.env.local (highest priority - gitignored)
.env.production (for npm run build)
.env.development (for npm run dev)
.env (default - gitignored)
.env.example (template - committed)
```

**Recommended:**
- Copy `.env.example` to `.env`
- Edit `.env` with your settings
- Never commit `.env` (already in .gitignore)

## Troubleshooting

### Logs tidak muncul padahal true?
1. Check spelling: `VITE_DEBUG_MODE` (case-sensitive!)
2. Check value: `true` (lowercase, no quotes needed)
3. Did you restart? `Ctrl+C` then `npm run dev`
4. Check console: `import.meta.env.VITE_DEBUG_MODE`

### Button 🐛 tidak muncul?
1. Same as above
2. Check import: `DEBUG_MODE` in AgentMode.tsx
3. Check condition: `{DEBUG_MODE && (<Button...`

### Logs masih muncul padahal false?
1. Clear cache: `npm run build`
2. Hard refresh: `Ctrl+Shift+R`
3. Check .env: Make sure it's `false` not `true`
4. Restart server

## Summary

```bash
# Enable Debug (Development)
VITE_DEBUG_MODE=true

# Disable Debug (Production)  
VITE_DEBUG_MODE=false

# Always restart after change!
npm run dev
```

Simple! 🎉
