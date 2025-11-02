# Council-Hades: Sistem Kecerdasan Kolektif Multi-Agent

## 🌍 Ringkasan

**Council-Hades** adalah sistem AI multi-agent revolusioner yang membawa kecerdasan kolektif ke ChatBotX. Berbeda dengan interaksi model tunggal tradisional, Council-Hades mengumpulkan lima agen AI berbeda dengan perspektif, keahlian, dan nilai yang berbeda untuk membahas pertanyaan kompleks melalui debat terstruktur, voting, dan pembangunan konsensus.

> "Kebenaran tidak muncul dari satu suara, melainkan dari percakapan antara banyak pikiran."

---

## 🏛️ Lima Anggota Dewan

Council-Hades terdiri dari lima anggota tetap, masing-masing mewakili cara berpikir yang unik:

### 🔬 The Analyst (Analis)
- **Fokus**: Logika, struktur, dan rasionalitas
- **Peran**: Memetakan masalah dari akar, memecah kompleksitas jadi pola
- **Dimensi Utama**: Logika, Kelayakan
- **Kepribadian**: Ilmiah, tenang, berbasis bukti

### 🔨 The Builder (Pelaksana)
- **Fokus**: Tindakan, realitas, dan langkah konkret
- **Peran**: Menerjemahkan ide menjadi rencana yang bisa dieksekusi
- **Dimensi Utama**: Kelayakan, Manfaat
- **Kepribadian**: Pragmatis, langsung, berorientasi hasil

### ⚖️ The Strategist (Penimbang)
- **Fokus**: Moralitas, etika, dan konsekuensi jangka panjang
- **Peran**: Suara hati, mengevaluasi dampak sosial dan etis
- **Dimensi Utama**: Etika, Keamanan
- **Kepribadian**: Bijaksana, berprinsip, melindungi nilai kemanusiaan
- **Kekuatan Khusus**: **Veto Etika** - Dapat menolak solusi atas dasar moral

### 🔍 The Auditor (Pengkritik)
- **Fokus**: Skeptisisme, validasi, dan pengawasan
- **Peran**: Menantang klaim, menemukan lubang logika, mencegah kesalahan
- **Dimensi Utama**: Logika, Keamanan
- **Kepribadian**: Kritis, teliti, percaya-tapi-verifikasi

### 🌟 The Moderator (Penyatu)
- **Fokus**: Kesadaran kolektif dan keseimbangan
- **Peran**: Mendengarkan semua suara, mensintesis kesatuan, membuat keputusan akhir
- **Dimensi Utama**: Kelima dimensi secara setara
- **Kepribadian**: Harmonis, seimbang, transparan

---

## 🔄 Proses Deliberasi

Setiap sesi Council mengikuti proses terstruktur enam tahap:

### Tahap 1: Perspektif Awal
Setiap agen (kecuali Moderator) memberikan pandangan pertama mereka tentang pertanyaan dari perspektif unik mereka.

### Tahap 2: Debat & Penyempurnaan (kondisional)
Agen menanggapi perspektif satu sama lain:
- Menantang asumsi yang lemah
- Mendukung poin yang kuat
- Menambahkan sudut pandang yang terlewat
- Mengajukan pertanyaan kritis

Jumlah putaran debat bervariasi per mode (1-3 putaran).

### Tahap 3: Proposal Solusi
Setiap agen menyusun proposal solusi konkret meliputi:
- Judul dan deskripsi
- Rencana eksekusi langkah demi langkah
- Risiko yang teridentifikasi
- Manfaat yang diharapkan

### Tahap 4: Voting
Setiap agen mengevaluasi **semua proposal** (termasuk milik sendiri) dalam **lima dimensi**:

| Dimensi | Pertanyaan |
|---------|------------|
| **Logika** | Seberapa konsisten dan rasional solusi ini? |
| **Kelayakan** | Apakah ini bisa diimplementasikan di dunia nyata? |
| **Keamanan** | Seberapa aman dan bebas risiko pendekatan ini? |
| **Manfaat** | Seberapa besar nilai yang dihasilkan? |
| **Etika** | Apakah ini bermoral dan menghormati martabat manusia? |

Setiap dimensi diberi skor 1-10 dengan alasan yang disediakan.

### Tahap 5: Sintesis Keputusan
Moderator:
1. Menghitung skor berbobot untuk setiap proposal
2. Memeriksa veto etika (Strategist dapat veto jika etika < ambang batas)
3. Memilih proposal valid dengan skor tertinggi
4. Mengumpulkan catatan minoritas dari agen yang punya kekhawatiran
5. Mensintesis keputusan akhir dengan:
   - Alasan yang jelas
   - Rekomendasi konkret
   - Strategi mitigasi risiko
   - Skor konsensus (0-10)

### Tahap 6: Refleksi Diri (kondisional)
Council merefleksikan prosesnya sendiri:
- Apa yang berjalan baik?
- Apa yang bisa ditingkatkan?
- Agen mana yang memberikan nilai paling besar?
- Apakah debatnya adil? (skor keadilan 0-10)
- Apakah ada bias yang terdeteksi?
- Apa yang dipelajari Council?

---

## ⚙️ Mode Operasi

Council-Hades dapat beroperasi dalam empat mode berbeda:

### ⚡ Quick Council (Dewan Cepat)
- **Terbaik untuk**: Pertanyaan sederhana, konfirmasi cepat
- **Putaran Debat**: 1 (minimal)
- **Veto Etika**: Nonaktif
- **Pembobotan**: Setara (semua agen bobot 1.0)
- **Refleksi**: Nonaktif
- **Kecepatan**: Tercepat

### 🧠 Deliberative Council (Dewan Deliberatif) - Default
- **Terbaik untuk**: Keputusan kompleks, masalah multi-faset
- **Putaran Debat**: 3 (deliberasi penuh)
- **Veto Etika**: Aktif
- **Pembobotan**: Adaptif (berdasarkan performa masa lalu)
- **Refleksi**: Aktif
- **Kecepatan**: Menyeluruh

### 🛡️ Ethical Council (Dewan Etis)
- **Terbaik untuk**: Topik sensitif, dilema moral, pertanyaan privasi/keamanan
- **Putaran Debat**: 2
- **Veto Etika**: Aktif (ambang batas lebih ketat: 6/10)
- **Pembobotan**: Kontekstual (Strategist dapat bobot lebih tinggi)
- **Refleksi**: Aktif
- **Kecepatan**: Sedang

### 🔧 Builder Council (Dewan Pembangun)
- **Terbaik untuk**: Masalah teknis, tugas implementasi, proyek coding
- **Putaran Debat**: 2
- **Veto Etika**: Nonaktif
- **Pembobotan**: Kontekstual (Builder & Analyst dapat bobot lebih tinggi)
- **Refleksi**: Nonaktif
- **Kecepatan**: Sedang

---

## 🎯 Sistem Voting & Pembobotan

### Pembobotan Setara
Semua agen punya suara sama (bobot = 1.0). Digunakan di mode Quick.

### Pembobotan Adaptif
Bobot menyesuaikan berdasarkan performa historis. Council belajar agen mana yang cenderung memberikan penilaian paling akurat seiring waktu.

### Pembobotan Kontekstual
Bobot menyesuaikan berdasarkan konten pertanyaan. Contoh:

**Pertanyaan Teknis** (kata kunci: code, implement, build, develop):
- Analyst: 1.2×
- Builder: 1.5×
- Strategist: 0.8×
- Auditor: 1.1×

**Pertanyaan Etis** (kata kunci: ethics, privacy, security, legal):
- Analyst: 0.9×
- Builder: 0.7×
- Strategist: 1.5×
- Auditor: 1.2×

**Pertanyaan Riset** (kata kunci: analyze, study, investigate):
- Analyst: 1.5×
- Builder: 0.8×
- Strategist: 1.0×
- Auditor: 1.3×

---

## 🛡️ Sistem Veto Etika

Strategist memegang kekuatan veto khusus untuk melindungi nilai moral:

- **Pemicu**: Ketika Strategist memberi skor proposal < 5 pada Etika (atau < 6 di mode Ethical)
- **Efek**: Proposal langsung didiskualifikasi
- **Alasan**: "Kebenaran tidak boleh mengorbankan kemanusiaan"
- **Override**: Tidak bisa di-override; jika semua proposal di-veto, sesi gagal dengan error

Ini memastikan Council tidak pernah merekomendasikan tindakan yang melanggar prinsip etika fundamental.

---

## 🎨 Antarmuka Pengguna

### Tab Setup
- Masukkan pertanyaan Anda
- Pilih mode operasi (Quick/Deliberative/Ethical/Builder)
- Pilih model AI untuk memberdayakan semua agen
- Tombol Convene the Council

### Tab The Council
- Lihat profil kelima agen
- Lihat peran, perspektif, dan system prompt mereka
- Pahami area fokus utama

### Tab Process (Langsung)
- Progress real-time saat Council bermusyawarah
- Lihat opini setiap agen saat dihasilkan
- Saksikan proposal dan vote yang di-cast
- Indikator progress untuk setiap tahap

### Tab Debate
- Baca perspektif awal dari semua agen
- Ikuti putaran debat (jika ada)
- Tinjau semua proposal solusi dengan skor
- Periksa hasil voting detail dengan breakdown dimensi

### Tab Decision
- Solusi terpilih final disorot
- Consensus meter (0-10)
- Alasan jelas dari Moderator
- Rekomendasi yang dapat ditindaklanjuti
- Identifikasi risiko & strategi mitigasi
- Kekhawatiran minoritas didokumentasikan
- Refleksi diri (jika aktif)

---

## 💡 Best Practice

### Kapan Menggunakan Council-Hades

**✅ Bagus Untuk:**
- Keputusan kompleks dengan banyak perspektif
- Dilema etis yang memerlukan pertimbangan hati-hati
- Masalah teknis yang butuh teori dan praktik
- Perencanaan strategis dengan implikasi jangka panjang
- Pertanyaan di mana Anda ingin sudut pandang beragam
- Situasi yang memerlukan penalaran transparan

**❌ Tidak Ideal Untuk:**
- Pertanyaan faktual sederhana
- Keadaan darurat sensitif-waktu yang butuh jawaban instan
- Pertanyaan dengan jawaban objektif benar (gunakan chat biasa)
- Penulisan kreatif (gunakan chat biasa atau mode Agent)

### Menyusun Pertanyaan Efektif

**Pertanyaan Bagus:**
- "Haruskah startup kami prioritaskan fitur privasi di atas pertumbuhan pengguna di tahun pertama?"
- "Apa pendekatan terbaik untuk mengimplementasikan kolaborasi real-time di aplikasi web kami?"
- "Bagaimana kami harus menangani permintaan penghapusan data pengguna agar sesuai GDPR?"

**Pertanyaan Buruk:**
- "Apa ibu kota Perancis?" (terlalu sederhana)
- "Tuliskan saya puisi" (bukan keputusan/masalah)
- "Apakah 2+2=4?" (fakta objektif)

### Menafsirkan Hasil

- **Konsensus 8+**: Kesepakatan kuat, kepercayaan tinggi pada keputusan
- **Konsensus 6-7.9**: Kesepakatan moderat, kekhawatiran valid ada
- **Konsensus <6**: Ketidaksepakatan signifikan, lanjutkan dengan hati-hati
- **Catatan Minoritas**: Selalu baca ini - mereka menyoroti blind spot
- **Veto Etika**: Jika dipicu, pertimbangkan ulang seluruh pendekatan

---

## 🚀 Memulai

### Quick Start

1. **Luncurkan Council**: Klik tombol ungu **Sparkles** (kanan-bawah)
2. **Ajukan Pertanyaan**: Masukkan pertanyaan kompleks di area teks
3. **Pilih Mode**: Pilih Deliberative untuk penggunaan pertama kali
4. **Pilih Model**: Pilih model yang mampu (rekomendasikan GPT-4 atau Claude-3)
5. **Convene**: Klik "Convene the Council"
6. **Saksikan**: Amati deliberasi secara real-time (tab Process)
7. **Tinjau**: Baca debat (tab Debate)
8. **Putuskan**: Lihat keputusan akhir (tab Decision)

### Contoh Sesi

**Pertanyaan**: "Chatbot AI kami mengumpulkan percakapan pengguna untuk training. Seorang pengguna sekarang meminta penghapusan penuh di bawah GDPR. Apa yang harus kami lakukan?"

**Mode**: Ethical Council

**Hasil** (hipotetis):
- **Analyst**: Mengidentifikasi persyaratan hukum, dependensi data
- **Builder**: Mengusulkan proses penghapusan teknis
- **Strategist**: Menekankan hak pengguna, merekomendasikan kepatuhan proaktif
- **Auditor**: Mempertanyakan apakah penghapusan benar-benar lengkap, menyarankan audit trail
- **Moderator**: Mensintesis jadi rencana aksi dengan penghapusan penuh + verifikasi
- **Konsensus**: 8.7/10 - Kesepakatan kuat dengan imperatif etis yang jelas

---

## 📊 Perbandingan dengan Mode Lain

| Fitur | Chat Biasa | Agent Mode | ASS Debate | Council-Hades |
|-------|-----------|------------|------------|---------------|
| Model Digunakan | 1 | Multiple | 2 | 1 (5 agen) |
| Perspektif | 1 | Multiple | 2 (berlawanan) | 5 (beragam) |
| Struktur | Percakapan | Perbandingan paralel | Format debat | Voting deliberatif |
| Terbaik Untuk | Q&A, coding | Perbandingan model | Eksplorasi argumen | Keputusan kompleks |
| Voting | Tidak | Tidak | Tidak | Ya (5 dimensi) |
| Veto Etika | Tidak | Tidak | Tidak | Ya |
| Skor Konsensus | Tidak | Tidak | Tidak | Ya |
| Refleksi | Tidak | Tidak | Tidak | Ya |

---

## 🎓 Filosofi & Prinsip

### Nilai Inti

1. **Kebenaran (Truth)**: Semua opini harus mencari kebenaran, bukan pembenaran
2. **Keseimbangan (Balance)**: Tidak ada ekstrem; pertimbangkan semua sisi
3. **Keamanan (Safety)**: Jangan pernah merugikan manusia, data, atau lingkungan
4. **Kemanusiaan (Humanity)**: Jaga martabat manusia dalam semua keputusan
5. **Transparansi (Transparency)**: Semua penalaran harus bisa dijelaskan
6. **Akuntabilitas (Accountability)**: Council mengakui kesalahan dan memperbaikinya
7. **Evolusi (Evolution)**: Semua keputusan bisa direvisi seiring pengetahuan berkembang

### Mengapa Multi-Agent?

> "Model AI tunggal bisa brilian tapi bias, cepat tapi gegabah, logis tapi dingin. Council-Hades menyeimbangkan setiap ekstrem dengan lawannya, menciptakan kebijaksanaan melalui keragaman."

- **Mencegah Groupthink**: Agen menantang satu sama lain
- **Menangkap Blind Spot**: Setiap agen melihat sudut berbeda
- **Menyeimbangkan Nilai**: Kelayakan teknis vs. kekhawatiran etis
- **Membangun Kepercayaan**: Proses transparan > keputusan black-box
- **Meningkat Seiring Waktu**: Refleksi memungkinkan pembelajaran

---

## 🐛 Troubleshooting

### Sesi Gagal Langsung
- **Cek API Key**: Pastikan provider model punya API key valid
- **Cek Model**: Beberapa model mungkin tidak mendukung system prompt
- **Cek Pertanyaan**: Pertanyaan sangat pendek mungkin membingungkan agen

### Semua Proposal Di-veto
- **Penyebab**: Semua solusi dianggap tidak etis oleh Strategist
- **Perbaikan**: Ubah pertanyaan untuk memungkinkan solusi etis
- **Contoh**: "Bagaimana hack X?" → "Bagaimana mengamankan X?"

### Skor Konsensus Rendah
- **Tidak Selalu Buruk**: Menunjukkan ketidaksepakatan asli
- **Tinjau Catatan Minoritas**: Pahami kekhawatirannya
- **Pertimbangkan**: Mungkin pertanyaan tidak punya jawaban "benar" yang jelas

### Performa Lambat
- **Normal**: Council membuat banyak panggilan LLM (15-30+ per sesi)
- **Percepat**: Gunakan mode Quick untuk pertanyaan lebih sederhana
- **Pilihan Model**: Model lebih cepat = sesi lebih cepat

---

## 🔧 Arsitektur Teknis

### Komponen Inti

```
src/lib/councilTypes.ts           # Definisi tipe, profil agen
src/lib/councilEngine.ts          # Engine deliberasi inti
src/components/CouncilMode.tsx            # Komponen UI utama
src/components/CouncilAgentCard.tsx       # Tampilan profil agen
src/components/CouncilDebateView.tsx      # Visualisasi debat
src/components/CouncilDecisionView.tsx    # Presentasi keputusan
```

### Alur Data

1. **Input Pengguna** → Pertanyaan + Pemilihan mode
2. **Inisialisasi Engine** → Instance CouncilEngine dibuat
3. **Eksekusi Tahap** → Eksekusi sekuensial 6 tahap
4. **Panggilan LLM** → Setiap agen diberdayakan oleh model AI terpilih
5. **Event Progress** → Update real-time ke UI
6. **Penyimpanan Hasil** → Sesi lengkap disimpan (objek CouncilSession)

---

## 📝 Referensi API (Untuk Developer)

### Menjalankan Sesi Secara Programatik

```typescript
import { runCouncilSession } from '@/lib/councilEngine';
import { CouncilMode } from '@/lib/councilTypes';

const session = await runCouncilSession(
  "Haruskah kami open-source data training AI kami?",
  'ethical' as CouncilMode,
  'gpt-4',
  'openrouter',
  (stage, data) => {
    console.log(`Stage: ${stage}`, data);
  }
);

console.log('Keputusan:', session.decision);
console.log('Konsensus:', session.decision?.consensus);
```

---

## 🙏 Kredit & Inspirasi

Council-Hades terinspirasi dari:
- **Teori Kecerdasan Kolektif**: Riset "wisdom of crowds"
- **Metode Socrates**: Kebenaran melalui dialog dan pertanyaan
- **Deliberasi Juri**: Pengambilan keputusan terstruktur dengan perspektif beragam
- **Dewan Buddha**: Preseden historis pencarian kebijaksanaan kolektif
- **Sistem Multi-Agent**: Riset AI tentang pemecahan masalah kolaboratif

Dibangun dengan ❤️ untuk ChatBotX.

---

## 📄 Lisensi & Penggunaan

Council-Hades adalah bagian dari ChatBotX dan mengikuti lisensi yang sama.

**Catatan**: Menggunakan Council-Hades mengkonsumsi lebih banyak token daripada chat biasa (15-30× lebih banyak) karena memberdayakan 5 agen melalui beberapa tahap. Pilih provider model AI Anda sesuai kebutuhan.

---

## 🤝 Kontribusi

Ingin meningkatkan Council-Hades?

- Tambahkan agen baru dengan perspektif unik
- Tingkatkan algoritma voting
- Buat mode operasi baru
- Tingkatkan UI/UX
- Tulis system prompt yang lebih baik untuk agen
- Tambahkan test dan benchmark

Lihat `AGENTS.md` untuk panduan kontribusi.

---

## 📞 Dukungan

- **Issues**: Laporkan bug via GitHub Issues
- **Pertanyaan**: Tanyakan di komunitas ChatBotX
- **Feedback**: Kami ingin mendengar bagaimana Council-Hades membantu pengambilan keputusan Anda!

---

**Ingat**: Council-Hades adalah alat untuk deliberasi, bukan pengganti penilaian manusia. Selalu pertimbangkan saran Council dalam konteks dan buat keputusan akhir berdasarkan nilai dan keadaan Anda sendiri.

*"Kecerdasan tertinggi bukan hanya mengetahui apa yang benar, tetapi memahami mengapa kebenaran harus dijaga."*  
— Prinsip Inti Council-Hades