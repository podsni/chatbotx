# 🔧 Fix: Groq Tab Not Showing

## Problem
Groq tab tidak muncul di Model Selector

## Root Cause
API key Groq hilang dari `.env` file

## Solution
✅ API key sudah ditambahkan kembali

## 📝 Steps to Fix

1. **Stop dev server** (Ctrl+C di terminal)
2. **Restart server**:
   ```bash
   npm run dev
   ```
3. **Refresh browser**
4. Click "New Chat"
5. **Groq tab will appear!** ✅

## ✅ After Restart

You will see **3 tabs**:
- Poe (2)
- Together AI (4)  
- **Groq (5)** ← Will appear now!

## Why Restart Needed?

Vite reads `.env` only on startup. Changes to `.env` require restart to take effect.

---

**Status**: Fixed! Just restart dev server 🚀
