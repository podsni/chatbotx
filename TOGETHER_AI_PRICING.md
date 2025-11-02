# Together AI - Auto-Update & Pricing Guide

## 🎯 Overview

Together AI models sekarang **auto-update** dengan informasi pricing real-time! Sistem ini mirip dengan OpenRouter, tapi fokus pada **chat models** dengan **detail harga lengkap**.

---

## ✨ Fitur Utama

### 1. **Auto-Discovery Chat Models**
- ✅ Fetch otomatis dari Together AI API
- ✅ Filter hanya **chat models** (bukan embedding/image models)
- ✅ Update setiap **24 jam** otomatis
- ✅ Cached di localStorage untuk performa optimal

### 2. **Pricing Information**
- 💰 **Input pricing** (per 1M tokens)
- 💰 **Output pricing** (per 1M tokens)
- 💰 **Hourly pricing** (untuk reserved instances)
- 🆓 **Free models** terdeteksi otomatis (pricing = $0)

### 3. **Advanced Filtering**
Filter berdasarkan harga:
- **All** - Semua model
- **🆓 Free** - Model gratis saja
- **Cheapest** - 10 model termurah
- **Premium** - 10 model termahal

### 4. **Price Display**
- Badge warna untuk kategori harga
- Format harga yang mudah dibaca
- Estimasi biaya untuk input/output tokens

---

## 📊 Pricing Categories

### Free Models (🆓)
```
Harga: $0.00 input + $0.00 output
Warna: Hijau (Green)
Badge: 💚 Free
```

### Cheap Models (💙)
```
Harga: < $1.00 total per 1M tokens
Warna: Biru (Blue)
Badge: Input/Output pricing
```

### Standard Models (💛)
```
Harga: $1.00 - $2.00 total per 1M tokens
Warna: Kuning (Yellow)
Badge: Input/Output pricing
```

### Premium Models (🧡)
```
Harga: > $2.00 total per 1M tokens
Warna: Orange
Badge: Input/Output pricing
```

---

## 🚀 Cara Menggunakan

### A. Akses Together AI Pricing Tab

1. **Buka Sidebar**
   - Desktop: Sidebar kiri selalu terlihat
   - Mobile: Klik hamburger menu (☰)

2. **Klik Tab "Pricing"** (icon 💲)
   - Tab pertama: Models (semua provider)
   - Tab kedua: **Pricing** (Together AI focus)

3. **Lihat Model List**
   - Scroll untuk lihat semua chat models
   - Setiap model menampilkan pricing info

### B. Filter Berdasarkan Harga

```
┌──────────────────────────────────────┐
│  [All]  [🆓 Free]  [Cheapest]  [Premium]  │
└──────────────────────────────────────┘
```

**Filter "All":**
- Tampilkan semua chat models
- Sorted by pricing (murah ke mahal)

**Filter "🆓 Free":**
- Hanya model dengan pricing $0
- Perfect untuk testing & development

**Filter "Cheapest":**
- Top 10 model termurah
- Great for production dengan budget terbatas

**Filter "Premium":**
- Top 10 model termahal
- Biasanya model terbesar & terkuat

### C. Lihat Detail Model

Setiap model card menampilkan:

```
┌─────────────────────────────────────┐
│ Meta Llama 3.3 70B Instruct  [FREE] │
│ Meta                          200K  │
├─────────────────────────────────────┤
│ 💚 Completely Free                  │
├─────────────────────────────────────┤
│ meta-llama/Llama-3.3-70B-Instruct   │
└─────────────────────────────────────┘
```

**Untuk model berbayar:**
```
┌─────────────────────────────────────┐
│ Qwen 2.5 72B Instruct         128K  │
│ Qwen                                │
├─────────────────────────────────────┤
│ ⬆️ $0.60/1M    ⬇️ $0.60/1M         │
├─────────────────────────────────────┤
│ Qwen/Qwen2.5-72B-Instruct           │
└─────────────────────────────────────┘
```

**Legend:**
- ⬆️ = Input tokens pricing
- ⬇️ = Output tokens pricing
- Context badge = Max context length

---

## 📱 UI Components

### 1. Header Section
```
┌─────────────────────────────────────┐
│ 💲 Together AI Models          [Refresh] │
│ Chat models • Auto-updated every 24h │
└─────────────────────────────────────┘
```

### 2. Status Bar
```
┌─────────────────────────────────────┐
│ ✅ 89 models (12 free, 77 paid)     │
│                          2h 15m ago │
└─────────────────────────────────────┘
```

### 3. Filter Buttons
```
┌──────┬─────────┬───────────┬──────────┐
│ All  │ 🆓 Free │ Cheapest  │ Premium  │
│  89  │   12    │    10     │    10    │
└──────┴─────────┴───────────┴──────────┘
```

### 4. Model Cards
- **Compact Design** - Mudah scan
- **Color-coded Pricing** - Quick visual feedback
- **Context Length Badge** - Token limit info
- **Organization Tag** - Model creator

---

## 🔄 Auto-Update System

### Cache Mechanism
```typescript
// Cache Structure
{
  models: TogetherModel[],
  timestamp: number
}

// Cache Key
localStorage: "together_chat_models_cache"

// Cache Duration
24 hours (86400000 ms)
```

### Update Flow
```
1. App Start
   ↓
2. Check Cache
   ├─ Valid (< 24h) → Load from cache ✅
   └─ Invalid → Fetch from API
       ↓
3. Fetch from Together AI API
   ↓
4. Filter Chat Models Only
   ↓
5. Parse Pricing Info
   ↓
6. Save to Cache
   ↓
7. Display in UI
```

### Manual Refresh
```
1. Click "Refresh" button
2. Force fetch from API
3. Update cache
4. Re-render UI
5. Show toast notification
```

---

## 💡 Pricing Logic

### Free Detection
```typescript
const isFree = (model) => {
  return (
    model.pricing.input === 0 &&
    model.pricing.output === 0 &&
    model.pricing.hourly === 0
  );
};
```

### Cost Calculation
```typescript
// Total cost per 1M tokens
const totalCost = pricing.input + pricing.output;

// Categories
if (totalCost === 0) → FREE (Green)
if (totalCost < 1.0)  → CHEAP (Blue)
if (totalCost < 2.0)  → STANDARD (Yellow)
if (totalCost >= 2.0) → PREMIUM (Orange)
```

### Cost Estimation
```typescript
// Estimate cost for usage
const estimateCost = (model, inputTokens, outputTokens) => {
  const inputCost = (model.pricing.input * inputTokens) / 1000000;
  const outputCost = (model.pricing.output * outputTokens) / 1000000;
  return inputCost + outputCost;
};

// Example: 10K input, 5K output on $0.60/$0.60 model
// Input:  (0.60 * 10000) / 1000000 = $0.006
// Output: (0.60 * 5000) / 1000000  = $0.003
// Total: $0.009
```

---

## 🎨 Price Formatting

### Format Logic
```typescript
if (price === 0)         → "Free"
if (price < 0.0001)      → "$X.XX/1M"  (show more decimals)
if (price < 0.001)       → "$0.XXXX/1M"
if (price < 0.01)        → "$0.XXX/1M"
if (price < 1)           → "$0.XX/1M"
if (price >= 1)          → "$X.XX/1M"
```

### Examples
```
0.00       → "Free"
0.00005    → "$0.05/1M"
0.0006     → "$0.0006/1M"
0.006      → "$0.006/1M"
0.06       → "$0.06/1M"
0.60       → "$0.60/1M"
6.00       → "$6.00/1M"
```

---

## 📋 Model Information

### Data Structure
```typescript
interface TogetherModel {
  id: string;                    // Model ID
  display_name: string;          // Human-readable name
  organization: string;          // Creator (Meta, Qwen, etc)
  context_length: number;        // Max tokens
  type: string;                  // "chat"
  link: string;                  // Documentation URL
  pricing: {
    input: number;               // $/1M tokens
    output: number;              // $/1M tokens
    hourly: number;              // $/hour
  };
  isFree: boolean;               // Computed flag
}
```

### Example Model
```json
{
  "id": "meta-llama/Llama-3.3-70B-Instruct",
  "display_name": "Meta Llama 3.3 70B Instruct",
  "organization": "Meta",
  "context_length": 204800,
  "type": "chat",
  "link": "https://...",
  "pricing": {
    "input": 0,
    "output": 0,
    "hourly": 0
  },
  "isFree": true
}
```

---

## 🔧 Integration with Main Sidebar

### Models Tab
Together AI models juga muncul di tab "Models" dengan:
- Search functionality
- All/Free filter
- **NEW:** Price filter (All/Free/Cheapest/Premium)
- **NEW:** Pricing badges on model cards

### Price Filter UI
```
┌─────────────────────────────────────┐
│ 🔍 Search models...                 │
├─────────────────────────────────────┤
│ 🎚️ [All 89] [🆓 Free 12]           │
├─────────────────────────────────────┤
│ 💲 [All] [🆓] [⬇️] [⬆️]             │
└─────────────────────────────────────┘
```

**Price Filter Icons:**
- 💲 All - Semua model
- 🆓 - Free saja
- ⬇️ - Cheapest (trending down)
- ⬆️ - Premium (trending up)

### Model Card Enhancement
```
┌─────────────────────────────────────┐
│ Qwen 2.5 72B Instruct        [Fast] │
│ High-quality reasoning model        │
│ ⬆️ $0.60/1M  ⬇️ $0.60/1M           │
└─────────────────────────────────────┘
```

---

## 🎯 Use Cases

### 1. Development & Testing
```
Filter: 🆓 Free
Models: 12 free chat models
Use: Test features tanpa cost
```

### 2. Budget Production
```
Filter: Cheapest
Models: Top 10 termurah
Use: Production dengan budget terbatas
```

### 3. High Performance
```
Filter: Premium
Models: Top 10 termahal (biasanya terkuat)
Use: Critical applications yang butuh kualitas terbaik
```

### 4. Cost Comparison
```
Filter: All
Action: Compare pricing across models
Use: Pilih model terbaik untuk budget & requirement Anda
```

---

## 🐛 Troubleshooting

### Q: Models tidak muncul?
**A:** Check:
1. VITE_TOGETHER_API_KEY di `.env`
2. API key valid dan aktif
3. Network connection OK
4. Check browser console untuk error

### Q: Pricing tidak akurat?
**A:** 
1. Click "Refresh" untuk update dari API
2. Together AI bisa update pricing sewaktu-waktu
3. Cache valid 24 jam, force refresh jika perlu

### Q: Free models kosong?
**A:**
1. Mungkin Together sedang tidak ada free models
2. Check pricing di Together AI dashboard
3. Try refresh untuk update

### Q: Cache tidak clear?
**A:**
1. Open DevTools → Application → LocalStorage
2. Delete key: `together_chat_models_cache`
3. Refresh page

---

## 🔐 Environment Setup

### Required Environment Variable
```bash
# .env file
VITE_TOGETHER_API_KEY=your-api-key-here
```

### Get API Key
1. Go to: https://api.together.xyz
2. Sign up / Login
3. Navigate to API Keys section
4. Create new key
5. Copy to `.env`

### Check Configuration
```typescript
// In browser console
console.log(import.meta.env.VITE_TOGETHER_API_KEY);
// Should show your key (not "undefined")
```

---

## 📈 Statistics & Performance

### Typical Data
- **Total Models**: ~80-100 chat models
- **Free Models**: ~10-15 models
- **Paid Models**: ~70-85 models
- **API Response**: ~2-3 seconds
- **Cache Load**: < 5ms

### Performance Metrics
```
Initial Load (no cache):     ~2-3s
Subsequent Loads (cached):   ~5ms
Manual Refresh:              ~2-3s
Search/Filter:               < 1ms
Render:                      ~50ms
```

---

## 🎓 Advanced Usage

### For Developers

#### Access Hook Directly
```typescript
import { useTogetherModels } from "@/hooks/useTogetherModels";

function MyComponent() {
  const {
    models,           // All models
    freeModels,       // Only free
    paidModels,       // Only paid (sorted)
    cheapestModel,    // Cheapest paid model
    mostExpensiveModel, // Most expensive
    isLoading,
    error,
    lastUpdated,
    refreshModels,
    totalCount,
    freeCount,
    paidCount
  } = useTogetherModels();
  
  // Use in your component
}
```

#### Format Price
```typescript
import { formatPrice } from "@/hooks/useTogetherModels";

const price = 0.0006;
console.log(formatPrice(price)); // "$0.0006/1M"
```

#### Estimate Cost
```typescript
import { estimateCost } from "@/hooks/useTogetherModels";

const model = { pricing: { input: 0.6, output: 0.6 } };
const cost = estimateCost(model, 10000, 5000);
console.log(cost); // 0.009 ($0.009)
```

---

## 🔗 Related Files

### Core Files
- `src/hooks/useTogetherModels.ts` - Hook for auto-update
- `src/components/TogetherModelManager.tsx` - Pricing UI
- `src/components/ChatSidebar.tsx` - Main sidebar integration
- `src/lib/aiApi.ts` - API integration

### Documentation
- `TOGETHER_AI_PRICING.md` - This file
- `SEARCH_FILTER_GUIDE.md` - Search & filter guide
- `OPENROUTER_GUIDE.md` - OpenRouter integration
- `README.md` - Main documentation

---

## 📊 Comparison: Together AI vs OpenRouter

| Feature | Together AI | OpenRouter |
|---------|-------------|------------|
| **Focus** | Chat models only | All model types |
| **Pricing** | Full pricing info | Free models only |
| **Filter** | 4 filters (All/Free/Cheap/Premium) | 2 filters (All/Free) |
| **Update** | 24h auto-update | 24h auto-update |
| **Cache** | localStorage | localStorage |
| **Models** | ~80-100 | ~50+ |
| **Free Count** | ~10-15 | ~47 |

---

## 💡 Tips & Best Practices

### 1. **Monitor Costs**
- Always check pricing before production
- Use free models for development
- Estimate costs based on expected usage

### 2. **Choose Right Model**
- Balance antara cost & quality
- Cheapest ≠ always bad
- Premium ≠ always necessary

### 3. **Update Regularly**
- Pricing bisa berubah
- Refresh setiap beberapa hari
- Check Together AI announcements

### 4. **Test Before Production**
- Try model dengan free tier dulu
- Measure actual token usage
- Calculate real costs

### 5. **Use Cheapest Filter**
- Great starting point untuk production
- Good quality/price ratio
- Update as needs grow

---

## 🎉 Conclusion

Fitur **Together AI Auto-Update & Pricing** membuat ChatBotX lebih powerful untuk:

✅ **Cost Management** - Lihat harga sebelum pakai  
✅ **Smart Selection** - Filter berdasarkan budget  
✅ **Always Updated** - Auto-refresh setiap 24h  
✅ **Easy Comparison** - Compare pricing dengan mudah  
✅ **Production Ready** - Full pricing transparency  

**Selamat menghemat biaya! 💰**

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Author**: ChatBotX Team