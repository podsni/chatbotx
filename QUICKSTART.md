# 🚀 Quick Start Guide

## Setup (3 langkah mudah!)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Konfigurasi API Key
Buat file `.env` di root folder:
```bash
VITE_POE_API_KEY=trXOhr-5J3szNi-uI82rYXZpKQgdY3YFC1fi0uMZLnI
```

### 3️⃣ Jalankan Aplikasi
```bash
npm run dev
```

Buka browser di `http://localhost:5173` 🎉

---

## 📱 Cara Pakai

### Pertama Kali Buka
1. **Welcome dialog** akan muncul otomatis
2. Pilih salah satu model AI:
   - **GPT-5-mini**: Untuk tugas kompleks (coding, analisis, dll)
   - **GPT-5-nano**: Untuk respons cepat
3. Klik **"Start Chat"**

### Membuat Chat Baru
1. Klik tombol **"New Chat"** di sidebar
2. Pilih model yang diinginkan
3. Mulai chat!

### Mengelola Session
- **Lihat Sessions**: Semua chat tersimpan di sidebar
- **Ganti Session**: Klik pada session yang ingin dibuka
- **Hapus Session**: Klik icon ⋮ → Delete

### Kirim Pesan
- Ketik pesan di input box
- Tekan **Enter** atau klik tombol **Send** ➤
- Response akan muncul dengan **live streaming**!

---

## ✨ Fitur Keren

### 📝 Markdown Support
AI response otomatis render markdown:
- **Bold**, *italic*, ~~strikethrough~~
- # Headings
- - Bullets & numbered lists
- `inline code`
- ```code blocks dengan syntax highlighting```
- [Links](https://example.com)
- Tables, blockquotes, dll

### 💻 Code Blocks
- **Syntax highlighting** untuk 100+ bahasa
- **Copy button** otomatis muncul
- Tampilan profesional seperti IDE

### 📊 Metadata
Setiap AI response menampilkan:
- ⏱️ **Duration**: Total waktu response
- ⚡ **TTFT**: Time to first token
- 🎯 **Tokens**: Jumlah token
- 🚀 **Speed**: Token per detik

### 💾 Auto-Save
- Semua chat **otomatis tersimpan** di browser (IndexedDB)
- **Offline-first**: Bisa baca chat lama tanpa internet
- **Privacy**: Data tersimpan lokal, tidak ke server

---

## 🎨 Tips & Tricks

### Keyboard Shortcuts
- `Enter`: Kirim pesan
- `Shift + Enter`: Baris baru

### Best Practices
1. **GPT-5-mini** untuk:
   - Generate code
   - Analisis kompleks
   - Writing panjang
   - Debugging

2. **GPT-5-nano** untuk:
   - Quick questions
   - Simple chat
   - Fast responses
   - Simple tasks

### Contoh Prompts
```
🔹 "Explain async/await in JavaScript"
🔹 "Write a Python function to sort array"
🔹 "Debug this code: [paste code]"
🔹 "Summarize this article: [paste text]"
🔹 "Create a responsive navbar in React"
```

---

## 🎯 Model Comparison

| Feature | GPT-5-mini | GPT-5-nano |
|---------|-----------|-----------|
| Speed | ⚡⚡⚡ Balanced | ⚡⚡⚡⚡⚡ Fast |
| Quality | ⭐⭐⭐⭐⭐ High | ⭐⭐⭐⭐ Medium |
| Context | 🎯 Long | 🎯 Medium |
| Best For | Complex tasks | Quick answers |

---

## 🐛 Troubleshooting

### API Key Error
```
❌ Error: POE API key is not configured
```
**Fix**: Check `.env` file, restart dev server

### Database Error
```
❌ Error: Failed to initialize local database
```
**Fix**: Clear browser data atau gunakan incognito

### Build Error
```bash
npm run build
```
Check console untuk error details

---

## 📦 Production Build

```bash
# Build untuk production
npm run build

# Preview build
npm run preview
```

Build output ada di folder `dist/`

---

## 🎓 Lebih Lanjut

- 📖 [README.md](./README.md) - Dokumentasi lengkap
- 🔧 [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Technical details
- 🎨 [Lovable Project](https://lovable.dev/projects/580a49b9-1db2-444a-919e-e0ef52b117b2)

---

## 💡 Need Help?

Buka issue atau check documentation!

Happy chatting! 🚀✨