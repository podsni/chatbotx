# 🚀 OpenRouter Quick Start - Model Gratis Auto-Update

## ✅ Setup Selesai!

API key OpenRouter sudah dikonfigurasi di file `.env`:
```
VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

## 📱 Cara Menggunakan (Mobile & Desktop)

### 1️⃣ Jalankan Aplikasi
```bash
npm run dev
```

### 2️⃣ Akses Model Manager
- Buka aplikasi di browser
- Di **Sidebar**, klik tab **"Settings"** (ikon gear ⚙️)
- Lihat section **"Free Models"** dengan badge hijau
- Anda akan melihat daftar model gratis yang tersedia

### 3️⃣ Mulai Chat dengan Model Gratis
- Kembali ke tab **"Models"** di sidebar
- Scroll ke section **"OpenRouter (Free)"** (warna hijau)
- Pilih salah satu model gratis
- Klik tombol **"+ Chat"**
- Mulai chatting! 🎉

## 🆓 Model Gratis Populer

### ⚡ Quick Tasks (3B-7B)
- **Llama 3.2 3B** - Compact, cepat untuk tugas sederhana
- **Mistral 7B** - Excellent untuk coding & quick responses

### 🎯 Balanced (8B-12B)
- **Llama 3.1 8B** - Reliable, versatile, recommended!
- **Nvidia Nemotron 12B** - Vision capable, multi-modal

### 🚀 Advanced (12B+)
- **MiniMax M2** - Multi-lingual, high quality
- **Nvidia Nemotron Nano 12B** - Vision + complex tasks

## 🔄 Auto-Update: Cara Kerja

### Otomatis (Recommended):
```
App Start → Check Cache → [Cache < 24h?]
   ↓ Yes: Use Cached Models ✅
   ↓ No:  Fetch New FREE Models → Update Cache ✅
```

### Manual Update:
1. Buka tab **"Settings"**
2. Klik tombol **"Refresh"** (ikon 🔄)
3. Tunggu beberapa detik
4. Model gratis terbaru akan muncul!

## 📱 Tampilan Mobile-Friendly

### Header Kompak:
- Badge jumlah model
- Tombol refresh yang mudah diakses
- Status update terakhir

### Model Cards:
- Nama model & badge "FREE"
- Deskripsi singkat (2 baris)
- Specs: Size, context length, modalities
- Model ID untuk referensi

### Responsive Design:
- Text size otomatis adjust (10px-14px)
- Layout stack di mobile
- Touch-friendly buttons (minimum 44px)
- Scrollable dengan momentum

## 🎨 Fitur UI

### Status Indicators:
- ✅ **Green check**: Models loaded successfully
- ❌ **Red alert**: Error loading models
- 🔄 **Spinner**: Loading/refreshing in progress
- ⏰ **Time**: Last update timestamp

### Model Badges:
- 🟢 **FREE**: Completely free model
- 🔵 **Size**: Model parameters (3B, 8B, 12B, etc)
- 🟣 **Context**: Context window size (128K, 1M, etc)
- 🟡 **Modality**: Input types (text, image, audio)

## ⚙️ Settings Tab Features

### Real-time Info:
- Total free models available
- Last updated time (e.g., "2h 30m ago")
- Status: Ready, Loading, or Error

### Model Details:
- **Name**: Full model name
- **Description**: What the model is good for
- **Size**: Parameters (1B-120B)
- **Context**: How much text it can process
- **Modalities**: What inputs it supports
- **ID**: Full model identifier

### Actions:
- **Refresh**: Manual update (works anytime)
- **Auto-refresh**: Happens every 24h automatically

## 🔧 Troubleshooting Mobile

### Model tidak muncul di mobile?
```bash
# 1. Cek API key
cat .env | grep OPENROUTER

# 2. Restart server
npm run dev

# 3. Force refresh di Settings tab
```

### Tampilan terpotong di mobile?
- Scroll ke bawah untuk lihat lebih banyak
- Badge akan wrap otomatis
- Text akan truncate dengan "..."

### Touch area terlalu kecil?
- Semua buttons minimum 44x44px
- Tap area lebih besar dari visual
- Hover effects tetap kerja di mobile

## 💡 Tips Penggunaan

### 🎯 Pilih Model yang Tepat:

**Chat Cepat & Ringan:**
- Llama 3.2 3B
- Mistral 7B

**Balanced & Reliable:**
- Llama 3.1 8B ⭐ RECOMMENDED
- MiniMax M2

**Complex Tasks:**
- Nvidia Nemotron 12B
- Model dengan context 1M+

### ⚡ Optimize Performance:

**Cache Management:**
- Biarkan cache 24 jam (default)
- Refresh manual hanya jika perlu
- Cache per browser (clear untuk reset)

**Model Selection:**
- Gunakan model terkecil yang cukup
- Model besar = response lebih lambat
- Tapi quality lebih tinggi

### 📊 Monitor Usage:

**Check di Settings:**
- Berapa model tersedia?
- Kapan terakhir update?
- Ada error atau tidak?

**Check di Console:**
```javascript
// Browser DevTools → Console
🔍 Environment Variables Check:
OPENROUTER: ✅
✅ OPENROUTER KEY LOADED: sk-or-v1-xxxxx...
🔄 Fetching OpenRouter models...
✅ Found 15 FREE models
```

## 🏗️ Build untuk Production

### Development Build:
```bash
npm run build:dev
```

### Production Build:
```bash
npm run build
```

### Preview Build:
```bash
npm run preview
```

**Note**: Auto-update tetap berfungsi di production! 🎉

## 📊 Cache Information

### Location:
```
Browser localStorage → "openrouter_free_models_cache"
```

### Duration:
```
24 hours (86400000 ms)
```

### Size:
```
~50-100KB (tergantung jumlah model)
```

### Clear Cache:
```javascript
// Di Browser Console:
localStorage.removeItem('openrouter_free_models_cache');
location.reload();
```

## 🔍 Debugging

### Check API Key:
```bash
# Terminal
cat .env | grep OPENROUTER

# Expected output:
VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

### Check Console Logs:
```javascript
// Browser DevTools → Console
🚀 Initializing OpenRouter free models...
💾 Using cached free models
// atau
🔄 Cache empty/expired, fetching fresh free models...
📊 Total models from API: 150
✅ Filtered 15 FREE models from 150 total models
✅ Found and cached 15 FREE models
```

### Check Network:
```
DevTools → Network tab → Filter "openrouter"
- Look for: /api/v1/models
- Status: 200 OK
- Response: Array of models
```

## 🎓 Advanced Features

### Filter Models:
Models otomatis difilter dengan 2 kriteria:
1. ID mengandung `:free`
2. Pricing `prompt = 0` DAN `completion = 0`

### Dynamic Loading:
- Models dari cache dimuat lebih dulu
- Jika cache expired, fetch dari API
- Fallback ke static models jika error

### Smart Caching:
- Save hanya FREE models (hemat space)
- Timestamp untuk expiry check
- Graceful fallback jika fetch gagal

## 📱 Mobile-Specific Features

### Responsive Text:
- Desktop: 12-14px
- Mobile: 10-12px
- Auto-adjust based on screen

### Touch Optimization:
- Minimum tap target: 44x44px
- Scroll momentum native
- Swipe gestures work

### Layout Adaptation:
- Flex stack on small screens
- Grid on larger screens
- Hidden text on extra small

### Performance:
- Lazy load model list
- Virtual scrolling (if needed)
- Debounced refresh button

## 🎯 Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## 📚 More Info

- **Full Guide**: See `OPENROUTER_GUIDE.md`
- **Features**: See `OPENROUTER_FEATURES.md`
- **API Docs**: https://openrouter.ai/docs
- **Model List**: https://openrouter.ai/models

## ✅ Checklist Setup

- [x] API key added to `.env`
- [x] Server restarted
- [x] OpenRouter provider active
- [x] Free models auto-loading
- [x] Settings tab available
- [x] Mobile responsive working
- [x] Cache system active
- [x] Auto-update every 24h

## 🎉 Ready to Use!

Sekarang Anda bisa:
1. ✅ Chat dengan model gratis
2. ✅ Lihat model baru di Settings
3. ✅ Auto-update setiap 24 jam
4. ✅ Gunakan di mobile & desktop
5. ✅ Pilih dari 15+ model gratis!

---

**Status**: ✅ PRODUCTION READY

**Last Updated**: Just now

**Model Count**: 15+ free models

**Update Frequency**: Every 24 hours

---

**🚀 Selamat menggunakan OpenRouter! Nikmati model AI gratis! 🎉**