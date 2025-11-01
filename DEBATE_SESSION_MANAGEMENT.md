# ASS Debate - Session Management & Analytics

Dokumentasi lengkap untuk sistem manajemen sesi debat dan analytics yang telah ditingkatkan.

## 📋 Daftar Isi

- [Fitur Baru](#fitur-baru)
- [Session Management](#session-management)
- [Continue Debate](#continue-debate)
- [Analytics & Visualizations](#analytics--visualizations)
- [Export/Import Sessions](#exportimport-sessions)
- [Panduan Penggunaan](#panduan-penggunaan)
- [API Reference](#api-reference)

---

## 🚀 Fitur Baru

### 1. **Session Management yang Komprehensif**
- ✅ Simpan sesi debat dengan metadata (tema, tags, catatan)
- ✅ Muat kembali sesi debat yang tersimpan
- ✅ Lanjutkan debat yang terhenti/dijeda
- ✅ Hapus sesi yang tidak diperlukan
- ✅ Export/import sesi dalam format JSON
- ✅ Pencarian dan filter sesi

### 2. **Enhanced Debate Analytics**
- ✅ Overview statistik debat (total rounds, argumen, kata, voting)
- ✅ Peringkat debater berdasarkan performa
- ✅ Analisis per-ronde dengan emotional tone detection
- ✅ Visualisasi pohon debat (debate tree)
- ✅ Tracking konsensus progress
- ✅ Influence dan consistency metrics

### 3. **Session Metadata**
Setiap sesi kini menyimpan:
- `theme` - Tema/kategori debat (opsional)
- `tags` - Tag untuk kategorisasi (opsional)
- `notes` - Catatan pengguna tentang debat (opsional)
- `createdAt` - Timestamp pembuatan
- `updatedAt` - Timestamp terakhir diperbarui
- `status` - Status debat: `in-progress`, `completed`, `paused`, `stopped`
- `canContinue` - Flag untuk menandai apakah debat bisa dilanjutkan

---

## 💾 Session Management

### Menyimpan Sesi

**Cara 1: Dari Setup Screen**
```
1. Klik tombol "Sesi (X)" di setup screen
2. Klik "Simpan Sesi Saat Ini" (jika ada sesi aktif)
3. Isi metadata:
   - Tema (contoh: "Teknologi", "Etika", "Politik")
   - Tags (pisahkan dengan koma)
   - Catatan (opsional)
4. Klik "Simpan"
```

**Cara 2: Dari Tab Sessions**
```
1. Saat debat berjalan, buka tab "Sesi"
2. Klik "Simpan Sesi Saat Ini"
3. Lengkapi metadata
4. Klik "Simpan"
```

### Memuat Sesi

```
1. Buka Session Manager (klik "Sesi (X)")
2. Pilih sesi yang ingin dimuat
3. Klik tombol "Muat"
4. Sesi akan dimuat ke interface
```

### Menghapus Sesi

```
1. Di Session Manager, cari sesi yang ingin dihapus
2. Klik ikon trash (🗑️) di kartu sesi
3. Konfirmasi penghapusan
```

### Filter & Search

**Filter Status:**
- Semua Status
- Selesai (completed)
- Berjalan (in-progress)
- Dijeda (paused)
- Dihentikan (stopped)

**Filter Mode:**
- Semua Mode
- Voting
- Classic
- Team
- Tournament
- Panel

**Search:**
- Cari berdasarkan pertanyaan debat
- Cari berdasarkan tema
- Cari berdasarkan tags

---

## ▶️ Continue Debate

Fitur baru yang memungkinkan melanjutkan debat yang terhenti/dijeda.

### Kapan Debat Bisa Dilanjutkan?

Debat dapat dilanjutkan jika:
- ✅ Status: `paused` atau `stopped`
- ✅ Belum mencapai batas maksimal ronde
- ✅ Konsensus belum tercapai
- ✅ `canContinue: true`

### Cara Melanjutkan Debat

```
1. Buka Session Manager
2. Cari sesi dengan badge biru "Lanjutkan"
3. Klik tombol "Lanjutkan"
4. Debat akan otomatis berlanjut dari ronde terakhir
```

### Automatic Status Management

**Status Transitions:**
```
Setup → in-progress (saat start)
in-progress → completed (konsensus tercapai)
in-progress → stopped (tombol Stop ditekan)
in-progress → paused (debat belum selesai tapi dihentikan sementara)
stopped/paused → in-progress (saat continue)
```

**canContinue Flag:**
- `true`: Debat bisa dilanjutkan
- `false`: Debat sudah selesai atau mencapai batas maksimal

---

## 📊 Analytics & Visualizations

### Tab Overview

**Kartu Statistik:**
- 📨 Total Ronde
- 📈 Total Argumen
- 📊 Rata-rata Kata per Argumen
- 🎯 Total Voting

**Status Konsensus:**
- Progress bar menunjukkan kemajuan debat
- Badge menunjukkan status (Tercapai/Belum Tercapai)
- Detail ronde tercapai konsensus (jika ada)

**Informasi Sesi:**
- Mode Debat
- Sistem Voting
- Threshold Konsensus (%)
- Jumlah Debater
- Durasi Aktif (menit)

### Tab Debaters

**Peringkat Debater:**

Debater diurutkan berdasarkan composite score:
```typescript
score = (rankingsSum × 10) + consistency + (influence × 5)
```

**Metrics per Debater:**
- 🏆 **Argumen**: Jumlah argumen yang dibuat
- 🗳️ **Vote Diterima**: Total vote dari debater lain
- 💫 **Pengaruh**: Berapa kali debater lain menyebut/mereferensi
- 📈 **Skor Ranking**: Akumulasi posisi dalam voting
- 📊 **Konsistensi**: Konsistensi panjang argumen (0-100%)
- 🔄 **Perubahan Keyakinan**: Seberapa besar belief berubah (0-100%)

**Winner Display:**
- Peringkat 1 mendapat 🏆 (emas)
- Peringkat 2 mendapat 🥈 (perak)
- Peringkat 3 mendapat 🥉 (perunggu)
- Ring highlight untuk pemenang

### Tab Rounds

**Analisis Per-Ronde:**

Setiap ronde menampilkan:
- **Type**: Opening / Argument / Rebuttal / Voting / Judge
- **Total Argumen**: Jumlah argumen di ronde ini
- **Rata-rata Panjang**: Panjang karakter rata-rata
- **Emotional Tone**: 
  - ➕ Positive (lebih banyak kata positif)
  - ➖ Negative (lebih banyak kata negatif)
  - ⚪ Neutral (seimbang)
- **Progress Konsensus**: Bar menunjukkan tingkat kesepakatan

**Border Color:**
- 🟢 Green: Positive tone
- 🔴 Red: Negative tone
- ⚫ Gray: Neutral tone

### Tab Tree (Debate Tree)

**Visualisasi Pohon Debat:**

Timeline vertikal menampilkan:
- 🔵 Node untuk setiap ronde (biru)
- 🟢 Node konsensus (hijau)
- 🟡 Node pemenang akhir (kuning)

**Setiap Node Menampilkan:**
- Nomor ronde
- Type badge
- Preview argumen setiap debater (100 karakter pertama)
- Emoji debater
- Belief update (jika ada)
- Jumlah vote yang dilakukan

**Final Winner Node:**
- Tampil di akhir jika ada pemenang
- Icon 🏆 Award
- Nama pemenang
- Gradient background

---

## 📤📥 Export/Import Sessions

### Export Sessions

**Bulk Export:**
```
1. Di Session Manager, pilih checkbox sesi yang ingin diekspor
2. Klik "Ekspor (X)" - X = jumlah sesi terpilih
3. File JSON akan otomatis terunduh
4. Nama file: debate-sessions-[timestamp].json
```

**Quick Select:**
- **Pilih Semua**: Pilih semua sesi yang tampil (sesuai filter)
- **Batal Pilih Semua**: Hapus semua pilihan

### Import Sessions

```
1. Klik tombol "Impor"
2. Pilih file JSON (hasil export sebelumnya)
3. Sistem akan memvalidasi dan mengimpor sesi
4. Sesi yang sudah ada (same ID) akan diabaikan
5. Toast notification menampilkan jumlah sesi terimport
```

**Format File JSON:**
```json
[
  {
    "id": "debate-1234567890",
    "question": "Haruskah...",
    "theme": "Teknologi",
    "tags": ["AI", "Etika"],
    "notes": "Debat menarik tentang...",
    "mode": "voting",
    "votingSystem": "ranked",
    "debaters": [...],
    "rounds": [...],
    "createdAt": 1234567890000,
    "updatedAt": 1234567890000,
    "status": "completed",
    "canContinue": false
  }
]
```

---

## 📖 Panduan Penggunaan

### Workflow Lengkap

#### 1. Memulai Debat Baru

```
Setup Screen:
├─ Masukkan pertanyaan debat
├─ Pilih mode debat (voting/classic/team/tournament/panel)
├─ Pilih sistem voting (ranked/approval/condorcet/borda)
├─ Pilih debater (min. 2)
├─ Konfigurasi per-debater (provider & model)
├─ Set consensus threshold & max iterations
└─ Klik "Mulai Debat"
```

#### 2. Monitoring Debat

```
Debate Screen:
├─ Tab "Debate": Lihat argumen real-time
├─ Tombol "Stop Debat": Hentikan kapan saja
└─ Auto-scroll ke argumen terbaru
```

#### 3. Menyimpan Sesi

```
Session Save:
├─ Klik "Sesi (X)" atau buka tab "Sesi"
├─ Klik "Simpan Sesi Saat Ini"
├─ Tambahkan metadata:
│  ├─ Theme: "Teknologi"
│  ├─ Tags: "AI, Etika, Future"
│  └─ Notes: "Debat sangat menarik..."
└─ Klik "Simpan"
```

#### 4. Analisis Hasil

```
Analytics Screen:
├─ Tab "Analytics":
│  ├─ Overview: Stats keseluruhan
│  ├─ Debaters: Peringkat & metrics
│  ├─ Rounds: Analisis per-ronde
│  └─ Tree: Visualisasi pohon debat
└─ Insights tentang winner, influence, consistency
```

#### 5. Melanjutkan Debat (Opsional)

```
Continue Debate:
├─ Buka Session Manager
├─ Filter status: "Dijeda" atau "Dihentikan"
├─ Cari sesi dengan badge "Lanjutkan"
├─ Klik "Lanjutkan"
└─ Debat berlanjut otomatis
```

#### 6. Export untuk Backup

```
Export:
├─ Pilih sesi yang ingin di-backup
├─ Klik "Ekspor (X)"
└─ Simpan file JSON di tempat aman
```

### Best Practices

**1. Metadata yang Baik:**
```
✅ Theme: Singkat dan deskriptif ("Teknologi", "Etika AI")
✅ Tags: Spesifik, pisahkan dengan koma ("GPT-5, Reasoning, Future")
✅ Notes: Tulis insight menarik atau konteks
```

**2. Kapan Continue vs New Debate:**
```
Continue: Jika ingin eksplorasi lebih dalam topik yang sama
New Debate: Jika ingin topik atau konfigurasi berbeda
```

**3. Export Berkala:**
```
- Export sesi penting setiap minggu
- Gunakan tags untuk identifikasi mudah
- Backup file export di cloud storage
```

**4. Filter Efektif:**
```
- Gunakan search untuk topik spesifik
- Filter by status untuk continue
- Filter by mode untuk analisis tren
```

---

## 🔧 API Reference

### Session Management Functions

#### `saveSession(session, metadata)`
```typescript
const saveSession = (
  session: DebateSession,
  metadata: {
    theme?: string;
    tags?: string[];
    notes?: string;
  }
) => void;
```

**Parameters:**
- `session`: Sesi debat yang akan disimpan
- `metadata.theme`: Tema/kategori debat
- `metadata.tags`: Array of tags
- `metadata.notes`: Catatan user

**Behavior:**
- Update existing session jika ID sama
- Create new session jika ID baru
- Auto-update `updatedAt` timestamp
- Persist to localStorage

#### `loadSession(session)`
```typescript
const loadSession = (session: DebateSession) => void;
```

**Parameters:**
- `session`: Sesi yang akan dimuat

**Side Effects:**
- Update UI state dengan data sesi
- Restore question, mode, voting system, dll
- Close session manager dialog
- Show success toast

#### `continueSession(session)`
```typescript
const continueSession = async (session: DebateSession) => Promise<void>;
```

**Parameters:**
- `session`: Sesi yang akan dilanjutkan

**Validation:**
- Check `canContinue` flag
- Verify not at max iterations
- Ensure status is not "completed"

**Behavior:**
- Update status to "in-progress"
- Resume debate from last round
- Auto-scroll to new arguments

#### `deleteSession(sessionId)`
```typescript
const deleteSession = (sessionId: string) => void;
```

**Parameters:**
- `sessionId`: ID sesi yang akan dihapus

**Behavior:**
- Remove from state
- Update localStorage
- Show confirmation dialog

#### `exportSessions(sessionIds)`
```typescript
const exportSessions = (sessionIds: string[]) => void;
```

**Parameters:**
- `sessionIds`: Array of session IDs to export

**Behavior:**
- Filter sessions by IDs
- Convert to JSON string
- Create download link
- Trigger browser download
- Filename: `debate-sessions-[timestamp].json`

#### `importSessions(sessions)`
```typescript
const importSessions = (sessions: DebateSession[]) => void;
```

**Parameters:**
- `sessions`: Array of sessions to import

**Behavior:**
- Validate JSON structure
- Skip duplicate IDs
- Merge with existing sessions
- Update localStorage
- Show toast with import count

### DebateSession Interface

```typescript
interface DebateSession {
  id: string;
  question: string;
  theme?: string;
  mode: DebateFormat;
  votingSystem: VotingSystem;
  debaters: Debater[];
  rounds: DebateRound[];
  consensusThreshold: number;
  maxIterations: number;
  finalDecision?: string;
  winner?: string;
  teams?: DebateTeam[];
  bracket?: TournamentBracket;
  analytics?: DebateAnalytics;
  
  // Metadata (NEW)
  createdAt: number;
  updatedAt: number;
  status: "in-progress" | "completed" | "paused" | "stopped";
  tags?: string[];
  notes?: string;
  canContinue?: boolean;
}
```

### Status Flow

```
┌─────────────┐
│   Setup     │
└──────┬──────┘
       │ start
       ▼
┌─────────────┐     stop     ┌─────────────┐
│ in-progress ├─────────────►│   stopped   │
└──────┬──────┘              └──────┬──────┘
       │                            │
       │ consensus                  │ continue
       │ reached                    │
       ▼                            ▼
┌─────────────┐              ┌─────────────┐
│  completed  │              │ in-progress │
└─────────────┘              └─────────────┘
       ▲
       │ max iterations
       │ or stop without
       │ continue option
┌──────┴──────┐
│   paused    │
└─────────────┘
```

---

## 🎯 Tips & Tricks

### 1. Tema Debat yang Efektif
```
❌ Buruk: "debat1", "test", "coba"
✅ Baik: "AI Ethics", "Climate Change", "Future of Work"
```

### 2. Sistem Tagging
```
Gunakan format: [Domain] [Subtopic] [Aspect]
Contoh: "Technology, AI, Ethics, GPT-5, Reasoning"
```

### 3. Continuous Learning
```
- Save setiap debat menarik
- Review analytics untuk pattern
- Bandingkan performa model berbeda
- Note down insights di metadata
```

### 4. Performance Monitoring
```
Analytics Tab → Debaters:
- Perhatikan influence score
- Identifikasi model terbaik
- Adjust model selection untuk debat berikutnya
```

### 5. Debate Tree Navigation
```
- Scroll untuk lihat full timeline
- Click node untuk context
- Perhatikan emotional tone per round
- Track konsensus progress
```

---

## 🐛 Troubleshooting

### "Tidak Dapat Dilanjutkan"
**Penyebab:**
- Status sudah "completed"
- Sudah mencapai max iterations
- `canContinue: false`

**Solusi:**
- Start new debate dengan pertanyaan sama
- Increase max iterations di settings

### Export File Corrupt
**Penyebab:**
- Session data tidak lengkap
- Browser interrupted download

**Solusi:**
- Re-export session
- Check console for errors
- Try smaller batch (fewer sessions)

### Import Failed
**Penyebab:**
- Invalid JSON format
- Missing required fields
- Corrupted file

**Solusi:**
- Validate JSON dengan JSON validator online
- Ensure file is from valid export
- Check file size (should match export)

### Analytics Not Showing
**Penyebab:**
- No rounds completed yet
- Debate just started

**Solusi:**
- Wait for at least 1 round to complete
- Tab will auto-enable when data available

---

## 📝 Changelog

### Version 2.0.0 (Current)

**Added:**
- ✨ Comprehensive session management
- ✨ Continue debate functionality
- ✨ Enhanced analytics with 4 tabs
- ✨ Debate tree visualization
- ✨ Session metadata (theme, tags, notes)
- ✨ Export/import sessions
- ✨ Search and filter sessions
- ✨ Automatic status management
- ✨ Session detail dialog
- ✨ Bulk session operations

**Improved:**
- 📊 Better analytics calculations
- 🎨 Enhanced UI/UX for session manager
- 🔄 Automatic session state persistence
- 📈 More detailed debater metrics
- 🌳 Interactive debate tree with timeline

**Fixed:**
- 🐛 Session state synchronization
- 🐛 Analytics calculation edge cases
- 🐛 Tree visualization overflow

---

## 🚀 Future Enhancements

### Planned Features

1. **Session Sharing**
   - Share session via URL
   - QR code generation
   - Public session gallery

2. **Advanced Analytics**
   - Sentiment analysis per argument
   - Topic modeling
   - Argument network graph
   - Comparison between sessions

3. **Collaboration**
   - Real-time collaborative debates
   - Comment on arguments
   - Vote on public sessions

4. **AI Insights**
   - Auto-generate summary
   - Key points extraction
   - Winner prediction

5. **Export Formats**
   - PDF report generation
   - Markdown export
   - CSV for spreadsheet analysis

---

## 📚 References

- [ASS Debate Core Documentation](./ASS_DEBATE_IMPROVEMENTS.md)
- [Model Selection Feature](./MODEL_SELECTION_FEATURE.md)
- [Mobile Optimization](./MOBILE_FIX_SUMMARY.md)
- [Repository Guidelines](./AGENTS.md)

---

## 💡 Examples

### Example 1: Research Debate Session

```json
{
  "theme": "AI Safety Research",
  "tags": ["AI", "Safety", "Research", "AGI"],
  "notes": "Debat tentang pendekatan terbaik untuk AI safety dengan 4 perspektif berbeda. Skeptic menang dengan argumen risk-based approach.",
  "question": "Apa pendekatan terbaik untuk memastikan keamanan AGI?",
  "mode": "voting",
  "status": "completed",
  "winner": "skeptic"
}
```

### Example 2: Philosophical Discussion

```json
{
  "theme": "Philosophy of Mind",
  "tags": ["Philosophy", "Consciousness", "Free Will"],
  "notes": "Diskusi mendalam tentang free will vs determinism. Belum mencapai konsensus, worth continuing.",
  "question": "Apakah kehendak bebas adalah ilusi?",
  "mode": "panel",
  "status": "paused",
  "canContinue": true
}
```

### Example 3: Technical Debate

```json
{
  "theme": "Software Architecture",
  "tags": ["Tech", "Architecture", "Microservices", "Monolith"],
  "notes": "Pragmatist menang dengan pendekatan hybrid. Good insights tentang trade-offs.",
  "question": "Microservices vs Monolith: mana yang lebih baik?",
  "mode": "team",
  "status": "completed",
  "winner": "pragmatist"
}
```

---

**Dibuat dengan ❤️ untuk ChabotX ASS Debate System**

Version: 2.0.0 | Last Updated: 2024