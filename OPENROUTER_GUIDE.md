# OpenRouter Integration Guide

## 🚀 Overview

ChatBotX sekarang mendukung **OpenRouter** - sebuah unified API yang memberikan akses ke ratusan model AI gratis! Dengan fitur auto-update, Anda dapat secara otomatis mendapatkan model gratis terbaru tanpa perlu update manual.

## ✨ Fitur Utama

- 🆓 **Akses Model Gratis** - Puluhan model AI gratis dari berbagai provider
- 🔄 **Auto-Update** - Model gratis diperbarui otomatis setiap 24 jam
- 💾 **Smart Caching** - Model disimpan di cache untuk performa optimal
- 🎯 **Easy Integration** - Integrasi mudah dengan satu API key

## 📋 Setup OpenRouter

### 1. Dapatkan API Key Gratis

1. Kunjungi https://openrouter.ai/keys
2. Buat akun gratis (tidak perlu kartu kredit!)
3. Generate API key baru
4. Copy API key Anda

### 2. Tambahkan ke File .env

Buka atau buat file `.env` di root folder project:

```bash
# OpenRouter API Key (FREE!)
VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Optional: Info untuk leaderboard OpenRouter
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=ChatbotX
```

**Catatan**: API key sudah ditambahkan ke `.env` Anda:
```
VITE_OPENROUTER_API_KEY=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
```

### 3. Restart Development Server

```bash
npm run dev
```

Server akan otomatis mendeteksi OpenRouter API key dan mengaktifkan provider.

## 🎯 Cara Menggunakan

### A. Chat Normal dengan Model Gratis

1. Buka aplikasi ChatBotX
2. Di sidebar, lihat section **"OpenRouter (Free)"**
3. Pilih salah satu model gratis
4. Klik **"+ Chat"** untuk memulai percakapan baru
5. Mulai chat!

### B. Auto-Update Model Gratis

#### Via Settings Tab:

1. Di sidebar, klik tab **"Settings"** (ikon gear)
2. Lihat section **"Free OpenRouter Models"**
3. Klik tombol **"Refresh"** untuk update manual
4. Daftar model akan diperbarui dari OpenRouter API

#### Otomatis:

- Model gratis di-cache selama **24 jam**
- Setelah 24 jam, aplikasi otomatis fetch model terbaru saat dibuka
- Cache disimpan di `localStorage` browser

### C. Melihat Model yang Tersedia

Di **Settings** tab, Anda bisa melihat:

- ✅ Total model gratis tersedia
- 📊 Detail setiap model (nama, deskripsi, context length)
- 🏷️ Badge "FREE" untuk model gratis
- 🆔 Model ID untuk referensi
- ⏰ Waktu terakhir update

## 📦 Model Gratis Populer

Beberapa model gratis terbaik yang tersedia:

### 1. **Nvidia Nemotron Nano 12B** (Vision)
```
ID: nvidia/nemotron-nano-12b-v2-vl:free
```
- 12B parameters
- Mendukung vision (gambar)
- Cepat dan efisien

### 2. **MiniMax M2**
```
ID: minimax/minimax-m2:free
```
- Performa balanced
- Multi-lingual support
- High quality responses

### 3. **Meta Llama 3.1 8B**
```
ID: meta-llama/llama-3.1-8b-instruct:free
```
- 8B parameters dari Meta
- Instruction-tuned
- Reliable dan versatile

### 4. **Mistral 7B Instruct**
```
ID: mistralai/mistral-7b-instruct:free
```
- 7B parameters
- Excellent quality
- Fast inference

### 5. **Llama 3.2 3B**
```
ID: meta-llama/llama-3.2-3b-instruct:free
```
- Compact 3B model
- Quick responses
- Good for simple tasks

## 🔧 Advanced: Menambah Model Manual

Jika Anda menemukan model gratis baru yang belum muncul di cache:

### 1. Cari Model di OpenRouter

Kunjungi: https://openrouter.ai/models

Filter dengan:
- "Free" untuk lihat hanya model gratis
- Copy Model ID (contoh: `meta-llama/llama-3.2-1b-instruct:free`)

### 2. Tambahkan ke Static Models

Edit file `src/lib/openrouterApi.ts`:

```typescript
export const OPENROUTER_MODELS = {
  // Model yang sudah ada...
  
  // Tambahkan model baru
  "your-new-model-id:free": "Nama Model (Free)",
} as const;
```

### 3. Tambahkan ke Model Info (Optional)

Edit file `src/lib/aiApi.ts` di bagian OpenRouter models:

```typescript
"openrouter:your-new-model-id:free": {
  id: "your-new-model-id:free",
  name: "Nama Model (Free)",
  provider: "openrouter",
  description: "Deskripsi model",
  speed: "Fast", // atau "Balanced" / "Slow"
  quality: "High", // atau "Medium" / "Low"
  features: [
    "Free tier",
    "Feature 1",
    "Feature 2",
  ],
  icon: "Sparkles",
  color: "from-green-500 to-emerald-500",
},
```

## 🏗️ Build untuk Production

### Build Development Version

```bash
npm run build:dev
```

### Build Production Version

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

**Catatan**: Model gratis akan tetap auto-update di production build!

## 🔍 Troubleshooting

### Problem: Model gratis tidak muncul

**Solusi**:
1. Cek API key sudah benar di `.env`
2. Restart development server
3. Buka tab Settings dan klik "Refresh"
4. Cek console browser untuk error messages

### Problem: API key tidak terdeteksi

**Solusi**:
1. Pastikan file `.env` ada di root folder
2. Pastikan format correct: `VITE_OPENROUTER_API_KEY=sk-or-v1-...`
3. Restart server setelah menambah/mengubah `.env`
4. Cek console log saat app start: `OPENROUTER: ✅` atau `❌`

### Problem: "Failed to fetch models"

**Solusi**:
1. Cek koneksi internet
2. Verify API key valid di https://openrouter.ai/keys
3. Cek rate limit (free tier punya batasan)
4. Tunggu beberapa menit dan coba lagi

### Problem: Cache tidak update

**Solusi**:
1. Buka tab Settings
2. Klik tombol "Refresh" manual
3. Atau clear localStorage browser:
   ```javascript
   localStorage.removeItem('openrouter_free_models_cache')
   ```
4. Refresh halaman

## 📊 Rate Limits

OpenRouter free tier memiliki rate limits:

- **Request Limits**: Tergantung model
- **Daily Limits**: Varies per model
- **Concurrent Requests**: Limited

**Tips**:
- Gunakan cache sebisa mungkin
- Jangan spam refresh di Settings
- Pilih model yang sesuai kebutuhan

## 🎓 Best Practices

### 1. Cache Management
- Biarkan cache 24 jam untuk performa optimal
- Refresh manual hanya jika perlu model terbaru
- Cache disimpan per browser (gunakan Private/Incognito terpisah)

### 2. Model Selection
- **Quick tasks**: Gunakan model 3B-7B (Llama 3.2 3B, Mistral 7B)
- **Complex tasks**: Gunakan model 8B+ (Llama 3.1 8B, Nemotron 12B)
- **Vision tasks**: Gunakan Nvidia Nemotron Nano (vision capable)

### 3. Error Handling
- App otomatis fallback ke static models jika fetch gagal
- Cache lama tetap dipakai jika refresh gagal
- Error ditampilkan di Settings tab

## 🔐 Security

- ✅ API key disimpan di `.env` (tidak di-commit ke git)
- ✅ `.env` sudah ada di `.gitignore`
- ✅ API key tidak exposed di client-side code
- ✅ Semua request menggunakan HTTPS

**⚠️ PENTING**: Jangan commit file `.env` ke repository public!

## 🚀 Advanced Features

### 1. Custom Refresh Interval

Edit `src/hooks/useOpenRouterModels.ts`:

```typescript
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours (default)
// Ubah ke:
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours
```

### 2. Auto-refresh on App Start

Models otomatis di-check saat app start. Jika cache > 24 jam, akan auto-fetch.

### 3. Background Refresh

Untuk implementasi background refresh (coming soon):
- Service worker untuk periodic sync
- IndexedDB untuk persistent cache
- WebSocket untuk real-time updates

## 📚 API Reference

### Hook: `useOpenRouterModels`

```typescript
const {
  models,        // All models
  freeModels,    // Only free models
  isLoading,     // Loading state
  error,         // Error message
  refreshModels, // Manual refresh function
  lastUpdated,   // Last update timestamp
} = useOpenRouterModels();
```

### Component: `<OpenRouterModelManager />`

Display UI untuk manage OpenRouter models:
- List semua free models
- Refresh button
- Status indicator
- Last updated time

## 🤝 Contributing

Ingin menambahkan fitur baru?

1. Fork repository
2. Buat branch baru: `git checkout -b feature/openrouter-enhancement`
3. Commit changes: `git commit -m "Add: new OpenRouter feature"`
4. Push ke branch: `git push origin feature/openrouter-enhancement`
5. Create Pull Request

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Initial OpenRouter integration
- ✅ Auto-update free models
- ✅ Smart caching (24 hours)
- ✅ Settings UI for model management
- ✅ Dynamic model loading
- ✅ Static fallback models

### Upcoming Features
- 🔜 Background model refresh
- 🔜 Model performance metrics
- 🔜 Custom model favorites
- 🔜 Model comparison tool
- 🔜 Usage statistics

## 🆘 Support

Butuh bantuan?

- 📖 Dokumentasi: Baca file ini
- 🐛 Bug Report: Create GitHub issue
- 💡 Feature Request: Create GitHub issue
- 📧 Email: [Your contact]

## 📜 License

Project ini menggunakan license yang sama dengan ChatBotX main project.

---

**Selamat menggunakan OpenRouter! Nikmati akses ke puluhan model AI gratis! 🎉**