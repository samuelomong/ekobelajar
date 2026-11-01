/* ==========================================================
   PENGATURAN KAMPUS
   - Logo kampus: logo-unima.png (satu folder dengan index.html).
     Kalau file tidak ditemukan, tampil kotak "Logo Kampus" sebagai penanda.
   ========================================================== */
const CAMPUS = {
  name: "Universitas Negeri Manado",
  sub: "Media Pembelajaran Ekonomi",
  logo: "logo-unima.png"
};

/* ==========================================================
   DATA MATERI
   Cara menambah materi: salin salah satu objek di bawah.
   - icon / color : tampilan sampul otomatis jika foto belum ada
   - image : thumbnail. Default: yt("ID_VIDEO"). Bisa juga path foto lokal / URL gambar
   - video : { type: "youtube", id: "ID_VIDEO" }  -> video YouTube
             { type: "file",    src: "videos/x.mp4" } -> video dari komputer
             null -> tanpa video (materi tetap bisa dibuka)
   ========================================================== */
/* Thumbnail asli YouTube diambil otomatis dari ID video (butuh internet).
   Kalau gagal dimuat, kartu otomatis memakai sampul warna + ikon. */
const yt = id => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

const baseLessons = [
  {
    id: 1,
    title: "Permintaan dan Penawaran",
    topic: "Mikroekonomi",
    summary: "Bagaimana harga terbentuk dari pertemuan pembeli dan penjual.",
    icon: "⚖️",
    color: ["#0f766e", "#14b8a6"],
    image: yt("VMiJ0fRytE8"),
    video: { type: "youtube", id: "VMiJ0fRytE8" },
    minutes: 4,
    content: `
      <p>Harga pasar terbentuk saat jumlah barang yang diminta sama dengan jumlah yang ditawarkan. Titik pertemuan ini disebut <b>harga keseimbangan</b> (ekuilibrium).</p>
      <figure class="diagram">
        <svg viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">
          <line x1="40" y1="180" x2="300" y2="180" stroke="#94a3b8" stroke-width="2"/>
          <line x1="40" y1="20" x2="40" y2="180" stroke="#94a3b8" stroke-width="2"/>
          <line x1="60" y1="40" x2="280" y2="160" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
          <line x1="60" y1="160" x2="280" y2="40" stroke="#0f766e" stroke-width="4" stroke-linecap="round"/>
          <line x1="40" y1="100" x2="170" y2="100" stroke="#f59e0b" stroke-dasharray="5 4" stroke-width="2"/>
          <line x1="170" y1="100" x2="170" y2="180" stroke="#f59e0b" stroke-dasharray="5 4" stroke-width="2"/>
          <circle cx="170" cy="100" r="7" fill="#f59e0b"/>
          <text x="284" y="165" fill="#dc2626" font-weight="700">D</text>
          <text x="284" y="40" fill="#0f766e" font-weight="700">S</text>
          <text x="176" y="94" fill="#b45309" font-weight="700">E</text>
          <text x="2" y="14" fill="#475569">Harga</text>
          <text x="150" y="200" fill="#475569">Jumlah</text>
        </svg>
        <figcaption>D = kurva permintaan, S = kurva penawaran, E = titik keseimbangan.</figcaption>
      </figure>
      <h4>Konsep utama</h4>
      <ul>
        <li><b>Hukum permintaan:</b> harga naik, jumlah diminta turun.</li>
        <li><b>Hukum penawaran:</b> harga naik, jumlah ditawarkan naik.</li>
        <li><b>Surplus:</b> penawaran lebih besar dari permintaan, harga cenderung turun.</li>
        <li><b>Kelangkaan:</b> permintaan lebih besar dari penawaran, harga cenderung naik.</li>
      </ul>
      <div class="example">💡 <b>Contoh:</b> Menjelang Lebaran, permintaan daging sapi melonjak sementara pasokan tetap, sehingga harganya naik.</div>`,
    points: ["Harga keseimbangan terjadi saat permintaan = penawaran.", "Harga naik → diminta turun, ditawarkan naik.", "Surplus menekan harga turun, kelangkaan mendorong harga naik."]
  },
  {
    id: 2,
    title: "Inflasi dan Deflasi",
    topic: "Makroekonomi",
    summary: "Penyebab dan dampak naik turunnya harga secara umum.",
    icon: "🔥",
    color: ["#b45309", "#f59e0b"],
    image: yt("LPEHdZ2Pzyo"),
    video: { type: "youtube", id: "LPEHdZ2Pzyo" },
    minutes: 4,
    content: `
      <p>Inflasi adalah kenaikan harga barang dan jasa <b>secara umum dan terus-menerus</b>. Kebalikannya, deflasi adalah penurunan harga secara umum.</p>
      <h4>Penyebab inflasi</h4>
      <ul>
        <li><b>Demand-pull:</b> permintaan masyarakat terlalu tinggi dibanding barang yang tersedia.</li>
        <li><b>Cost-push:</b> biaya produksi naik (upah, bahan baku, energi) sehingga harga jual naik.</li>
        <li><b>Imported inflation:</b> harga barang impor naik, misalnya karena kurs melemah.</li>
      </ul>
      <h4>Dampak</h4>
      <ul>
        <li>Daya beli menurun dan nilai tabungan tergerus.</li>
        <li>Orang berutang diuntungkan, pemberi pinjaman dirugikan.</li>
        <li>Deflasi berkepanjangan bisa membuat konsumen menunda belanja dan produksi melambat.</li>
      </ul>
      <div class="example">💡 <b>Contoh:</b> Jika inflasi 5% per tahun, uang Rp100.000 hari ini hanya setara daya beli sekitar Rp95.000 tahun depan.</div>`,
    points: ["Inflasi = harga naik umum dan terus-menerus.", "Dua penyebab utama: demand-pull dan cost-push.", "Inflasi tinggi menurunkan daya beli masyarakat."]
  },
  {
    id: 3,
    title: "Uang dan Perbankan",
    topic: "Moneter",
    summary: "Fungsi uang, jenis bank, dan peran bank sentral.",
    icon: "🏦",
    color: ["#1d4ed8", "#38bdf8"],
    image: yt("_HSH5ilP97o"),
    video: { type: "youtube", id: "_HSH5ilP97o" },
    minutes: 3,
    content: `
      <p>Uang adalah sesuatu yang diterima secara umum untuk pembayaran dan pelunasan utang.</p>
      <h4>Fungsi uang</h4>
      <ul>
        <li><b>Alat tukar:</b> memudahkan transaksi tanpa barter.</li>
        <li><b>Satuan hitung:</b> mengukur nilai barang dan jasa.</li>
        <li><b>Penyimpan nilai:</b> menyimpan kekayaan untuk masa depan.</li>
      </ul>
      <h4>Lembaga perbankan</h4>
      <ul>
        <li><b>Bank sentral (Bank Indonesia):</b> mengatur kebijakan moneter dan menjaga stabilitas rupiah.</li>
        <li><b>Bank umum:</b> menghimpun dana (tabungan, deposito) dan menyalurkannya (kredit).</li>
        <li><b>BPR:</b> melayani masyarakat dan usaha kecil di daerah.</li>
      </ul>
      <div class="example">💡 <b>Contoh:</b> Saat BI menaikkan suku bunga acuan, bunga kredit cenderung naik sehingga peredaran uang menurun dan inflasi lebih terkendali.</div>`,
    points: ["Tiga fungsi uang: alat tukar, satuan hitung, penyimpan nilai.", "Bank sentral mengatur moneter, bank umum menghimpun dan menyalurkan dana."]
  },
  {
    id: 4,
    title: "Produk Domestik Bruto (PDB)",
    topic: "Makroekonomi",
    summary: "Ukuran total nilai barang dan jasa yang dihasilkan suatu negara.",
    icon: "📊",
    color: ["#7c3aed", "#a78bfa"],
    image: yt("6siz7jSeJIw"),
    video: { type: "youtube", id: "6siz7jSeJIw" },
    minutes: 4,
    content: `
      <p>PDB mengukur nilai pasar semua barang dan jasa <b>akhir</b> yang diproduksi dalam suatu negara selama satu periode (biasanya setahun).</p>
      <h4>Tiga pendekatan penghitungan</h4>
      <ul>
        <li><b>Pengeluaran:</b> PDB = C + I + G + (X − M)</li>
        <li><b>Produksi:</b> menjumlahkan nilai tambah semua sektor usaha.</li>
        <li><b>Pendapatan:</b> menjumlahkan upah, sewa, bunga, dan laba.</li>
      </ul>
      <p>Ketiganya secara teori memberi hasil yang sama.</p>
      <h4>Arti simbol</h4>
      <ul>
        <li><b>C</b> konsumsi rumah tangga, <b>I</b> investasi, <b>G</b> belanja pemerintah.</li>
        <li><b>X</b> ekspor, <b>M</b> impor.</li>
      </ul>
      <div class="example">💡 <b>Contoh:</b> PDB <i>nominal</i> memakai harga berlaku, sedangkan PDB <i>riil</i> memakai harga konstan sehingga tidak terpengaruh inflasi.</div>`,
    points: ["PDB = nilai barang dan jasa akhir dalam negeri selama satu periode.", "Rumus pengeluaran: C + I + G + (X − M).", "PDB riil menghilangkan pengaruh inflasi."]
  },
  {
    id: 5,
    title: "Perdagangan Internasional",
    topic: "Ekonomi Global",
    summary: "Mengapa negara berdagang: ekspor, impor, dan keunggulan komparatif.",
    icon: "🚢",
    color: ["#0369a1", "#22d3ee"],
    image: yt("8kcxjcUgWyo"),
    video: { type: "youtube", id: "8kcxjcUgWyo" },
    minutes: 3,
    content: `
      <p>Negara berdagang karena perbedaan sumber daya alam, teknologi, dan efisiensi produksi.</p>
      <ul>
        <li><b>Ekspor:</b> menjual barang ke luar negeri.</li>
        <li><b>Impor:</b> membeli barang dari luar negeri.</li>
        <li><b>Keunggulan komparatif:</b> fokus memproduksi barang dengan biaya peluang terendah, lalu menukarnya.</li>
        <li><b>Neraca perdagangan:</b> selisih nilai ekspor dan impor.</li>
      </ul>
      <div class="example">💡 <b>Contoh:</b> Indonesia mengekspor minyak sawit dan batu bara, serta mengimpor mesin dan elektronik.</div>`,
    points: ["Perdagangan terjadi karena perbedaan sumber daya dan efisiensi.", "Keunggulan komparatif = biaya peluang terendah."]
  },
  {
    id: 6,
    title: "Pasar dan Struktur Pasar",
    topic: "Mikroekonomi",
    summary: "Persaingan sempurna, monopoli, oligopoli, dan monopolistik.",
    icon: "🛒",
    color: ["#be123c", "#fb7185"],
    image: yt("5Do_GCBigkU"),
    video: { type: "youtube", id: "5Do_GCBigkU" },
    minutes: 3,
    content: `
      <p>Struktur pasar ditentukan oleh jumlah penjual, jenis produk, dan kemudahan masuk ke pasar.</p>
      <ul>
        <li><b>Persaingan sempurna:</b> banyak penjual, produk sama, penjual tidak bisa menentukan harga.</li>
        <li><b>Monopoli:</b> satu penjual menguasai pasar dan menentukan harga.</li>
        <li><b>Oligopoli:</b> sedikit penjual besar yang saling memengaruhi.</li>
        <li><b>Persaingan monopolistik:</b> banyak penjual dengan produk yang dibedakan (merek, desain).</li>
      </ul>
      <div class="example">💡 <b>Contoh:</b> Pedagang sayur di pasar mendekati persaingan sempurna; PLN untuk listrik rumah tangga mendekati monopoli.</div>`,
    points: ["Cirinya: jumlah penjual, jenis produk, hambatan masuk.", "Monopoli = satu penjual, oligopoli = beberapa penjual besar."]
  }
];

/* ==========================================================
   DATA KUIS
   ========================================================== */
const baseQuestions = [
  { q: "Apa yang terjadi pada jumlah barang yang diminta jika harga naik (ceteris paribus)?",
    options: ["Naik", "Turun", "Tetap", "Tidak bisa ditentukan"], answer: 1,
    why: "Menurut hukum permintaan, harga dan jumlah diminta berbanding terbalik." },
  { q: "Kenaikan harga barang secara umum dan terus-menerus disebut...",
    options: ["Deflasi", "Resesi", "Inflasi", "Devaluasi"], answer: 2,
    why: "Inflasi adalah kenaikan harga umum yang berlangsung terus-menerus." },
  { q: "Rumus PDB pendekatan pengeluaran adalah...",
    options: ["C + I + G + (X - M)", "C + S + T", "W + R + I + P", "X + M"], answer: 0,
    why: "Konsumsi + Investasi + Belanja pemerintah + Ekspor neto." },
  { q: "Struktur pasar dengan satu penjual disebut...",
    options: ["Oligopoli", "Monopoli", "Persaingan sempurna", "Monopsoni"], answer: 1,
    why: "Mono = satu; penjual tunggal menguasai pasar." }
];


/* ==========================================================
   DATA TAMBAHAN (dipakai website publik & dashboard admin)
   Sumber: materi bawaan (di atas) + konten.js (hasil publikasi
   dari admin) + data lokal browser (draf admin).
   ========================================================== */
const CUSTOM_KEY = "ekobelajar-custom";

function loadCustom() {
  const c = { lessons: [], questions: [] };
  try {
    const x = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "null");
    if (x) { c.lessons = x.lessons || []; c.questions = x.questions || []; }
  } catch (e) {}
  return c;
}
function saveCustom(c) {
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(c)); return true; } catch (e) { return false; }
}
function publishedData() {
  const k = window.KONTEN_TAMBAHAN || {};
  return { lessons: k.lessons || [], questions: k.questions || [] };
}
function mergedData() {
  const pub = publishedData(), loc = loadCustom();
  const L = new Map(baseLessons.map(l => [l.id, l]));
  [...pub.lessons, ...loc.lessons].forEach(l => L.set(l.id, l));   // data lokal menimpa yang terpublikasi
  const Q = new Map(baseQuestions.map(q => [q.q, q]));
  [...pub.questions, ...loc.questions].forEach(q => Q.set(q.q, q));
  return { lessons: [...L.values()], questions: [...Q.values()] };
}

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PALETTE = [["#1f1b5c","#4b44b8"],["#a62b4b","#e05a7a"],["#b58900","#f4c20d"],["#0f766e","#14b8a6"],["#1d4ed8","#38bdf8"],["#7c3aed","#a78bfa"]];

function parseYouTubeId(v) {
  v = (v || "").trim();
  if (!v) return "";
  const m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(v) ? v : "";
}

// Teks biasa -> HTML. Baris kosong = paragraf, "- " = daftar, "## " = subjudul, **tebal**
function textToHTML(t) {
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  return t.trim().split(/\n\s*\n/).map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return "";
    if (lines.every(l => /^[-•]\s+/.test(l)))
      return "<ul>" + lines.map(l => "<li>" + inline(l.replace(/^[-•]\s+/, "")) + "</li>").join("") + "</ul>";
    if (lines[0].startsWith("## ")) return "<h4>" + inline(lines[0].slice(3)) + "</h4>" + (lines.length > 1 ? "<p>" + lines.slice(1).map(inline).join("<br>") + "</p>" : "");
    return "<p>" + lines.map(inline).join("<br>") + "</p>";
  }).join("\n");
}