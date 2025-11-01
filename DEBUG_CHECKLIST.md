# 🔍 Debug Checklist - Groq Tab Not Showing

## ✅ What To Check

### 1. Console Output (F12 in browser)

**Expected:**
```
🔍 Environment Variables Check:
POE: ✅
TOGETHER: ✅
GROQ: ✅
✅ GROQ KEY LOADED: gsk_YbCjZooAS...
```

**If you see:**
```
GROQ: ❌
❌ GROQ KEY NOT LOADED!
```

**Solution:** Server not restarted properly!
```bash
pkill -9 node
rm -rf node_modules/.vite
npm run dev
```

---

### 2. Available Providers Check

**Expected in console:**
```
📋 Final available providers: ['poe', 'together', 'groq']
```

**If you see:**
```
📋 Final available providers: ['poe', 'together']
```

**Problem:** Groq API key not loaded
**Solution:** Clear cache and restart

---

### 3. Model Selector Tabs

**Expected:** 3 tabs visible
- Poe (2)
- Together AI (4)
- Groq (5)

**If only 2 tabs:** Environment variable issue

---

## 🔧 Full Reset Procedure

```bash
# 1. Kill everything
pkill -9 node
sleep 2

# 2. Clear all cache
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf dist
sleep 1

# 3. Verify .env
cat .env | grep GROQ
# Should show: VITE_GROQ_API_KEY=gsk_...

# 4. Start fresh
npm run dev
```

---

## 🎯 After Restart Checklist

Open browser console (F12) and verify:

- [ ] See "🔍 Environment Variables Check:"
- [ ] POE: ✅
- [ ] TOGETHER: ✅  
- [ ] GROQ: ✅
- [ ] See "✅ GROQ KEY LOADED: gsk_..."
- [ ] See "📋 Final available providers: ['poe', 'together', 'groq']"
- [ ] Click "Browse All Models"
- [ ] See 3 tabs (Poe, Together, Groq)
- [ ] Click Groq tab
- [ ] See 5 Groq models

If ALL checked ✅ = SUCCESS! 🎉

If ANY unchecked ❌ = Restart procedure again!

---

## 💡 Why This Happens?

Vite caches environment variables in memory AND in cache files.

Regular Ctrl+C doesn't clear these caches!

That's why you MUST:
1. `pkill -9 node` (force kill)
2. `rm -rf node_modules/.vite` (clear cache)
3. Fresh `npm run dev`

---

## 🚨 Still Not Working?

Try nuclear option:
```bash
pkill -9 node
rm -rf node_modules/.vite node_modules/.cache dist .vite
npm run dev
```

This clears ALL caches!

---

**Remember:** ALWAYS check browser console first! 🔍
