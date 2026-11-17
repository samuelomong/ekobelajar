const merged = mergedData();      // materi bawaan + tambahan dari dashboard admin
let lessons = merged.lessons;
let questions = merged.questions;

/* ==========================================================
   UTILITAS
   ========================================================== */
const $ = id => document.getElementById(id);

// Penyimpanan progres (aman jika localStorage diblokir)
const STORE_KEY = "ekobelajar-done";
let done = new Set();
try { done = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]")); } catch (e) {}
function saveDone() { try { localStorage.setItem(STORE_KEY, JSON.stringify([...done])); } catch (e) {} }

function hasVideo(l) {
  if (!l.video) return false;
  if (l.video.type === "youtube") return !!l.video.id && !/GANTI/i.test(l.video.id);
  if (l.video.type === "file") return !!l.video.src;
  return false;
}

// Sampul warna + ikon (dipakai bila foto belum ada)
function coverHTML(l) {
  return `<div class="cover" style="--g:linear-gradient(135deg,${l.color[0]},${l.color[1]})"><span>${esc(l.icon)}</span></div>`;
}

// Gambar dengan cadangan sampul otomatis jika file tidak ditemukan
function imageOrCover(l, container) {
  const img = new Image();
  img.alt = l.title;
  img.onload = () => { container.innerHTML = ""; container.appendChild(img); };
  img.onerror = () => { container.innerHTML = coverHTML(l); };
  container.innerHTML = coverHTML(l);   // tampil dulu sampul, diganti jika foto ada
  if (l.image) img.src = l.image;
}

/* ==========================================================
   KAMPUS & STATISTIK
   ========================================================== */
$("campusName").textContent = CAMPUS.name;
$("campusSub").textContent = CAMPUS.sub;
$("footCampus").textContent = CAMPUS.name;
const logoImg = $("campusLogo");
logoImg.onerror = () => $("logoSlot").classList.add("empty");
logoImg.src = CAMPUS.logo;

function updateProgress() {
  const pct = Math.round((done.size / lessons.length) * 100);
  $("progressBar").style.width = pct + "%";
  $("progressText").textContent = `${done.size} dari ${lessons.length} materi · ${pct}%`;
  $("statLessons").textContent = lessons.length;
  $("statQuiz").textContent = questions.length;
  $("statDone").textContent = done.size;
}

/* ==========================================================
   RENDER KARTU, FILTER, PENCARIAN
   ========================================================== */
const grid = $("grid");
const filtersEl = $("filters");
const searchEl = $("search");
const emptyEl = $("empty");

let activeTopic = "Semua";

function renderFilters() {
  const topics = ["Semua", ...new Set(lessons.map(l => l.topic))];
  filtersEl.innerHTML = "";
  topics.forEach(t => {
    const b = document.createElement("button");
    b.className = "filter-btn" + (t === activeTopic ? " active" : "");
    b.textContent = t;
    b.onclick = () => { activeTopic = t; renderFilters(); renderCards(); };
    filtersEl.appendChild(b);
  });
}

function renderCards() {
  const keyword = searchEl.value.trim().toLowerCase();
  const list = lessons.filter(l =>
    (activeTopic === "Semua" || l.topic === activeTopic) &&
    (l.title + " " + l.summary + " " + l.topic).toLowerCase().includes(keyword)
  );

  grid.innerHTML = "";
  emptyEl.hidden = list.length > 0;

  list.forEach(l => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.innerHTML = `
      <div class="thumb"></div>
      <div class="card-body">
        <span class="tag">${esc(l.topic)}</span>
        <h3>${esc(l.title)}</h3>
        <p>${esc(l.summary)}</p>
        <span class="open-link">Buka materi</span>
      </div>`;
    const thumb = card.querySelector(".thumb");
    imageOrCover(l, thumb);
    if (hasVideo(l)) thumb.insertAdjacentHTML("beforeend", '<span class="play">Video</span>');
    if (done.has(l.id)) thumb.insertAdjacentHTML("beforeend", '<span class="badge-done">Selesai</span>');
    card.onclick = () => openModal(l.id);
    grid.appendChild(card);
  });
}

searchEl.addEventListener("input", renderCards);

/* ==========================================================
   MODAL (media + isi materi + navigasi)
   ========================================================== */
const modal = $("modal");
const modalMedia = $("modalMedia");
let currentId = null;

function openModal(id) {
  const idx = lessons.findIndex(x => x.id === id);
  const l = lessons[idx];
  currentId = id;

  $("modalTitle").textContent = l.title;
  $("modalTag").textContent = l.topic;
  $("modalTime").textContent = `±${l.minutes} menit baca`;
  $("modalBody").innerHTML = l.content;
  $("modalPoints").innerHTML = l.points && l.points.length
    ? `<h4>Poin penting</h4><ul>${l.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : "";

  if (hasVideo(l) && l.video.type === "youtube") {
    modalMedia.innerHTML = `<div class="ratio"><iframe src="https://www.youtube.com/embed/${encodeURIComponent(l.video.id)}"
      title="${esc(l.title)}" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"></iframe></div>
      <a class="yt-link" href="https://www.youtube.com/watch?v=${encodeURIComponent(l.video.id)}" target="_blank" rel="noopener noreferrer">Buka video di YouTube</a>`;
  } else if (hasVideo(l) && l.video.type === "file") {
    modalMedia.innerHTML = `<video controls src="${esc(l.video.src)}"></video>`;
  } else {
    imageOrCover(l, modalMedia);
  }

  $("prevLesson").disabled = idx === 0;
  $("nextLesson").disabled = idx === lessons.length - 1;
  refreshDoneBtn();

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  $("modal").querySelector(".modal-box").scrollTop = 0;
}

function refreshDoneBtn() {
  const b = $("doneLesson");
  const isDone = done.has(currentId);
  b.textContent = isDone ? "Sudah selesai" : "Tandai selesai";
  b.classList.toggle("is-done", isDone);
}

function closeModal() {
  modal.hidden = true;
  modalMedia.innerHTML = "";          // hentikan video
  document.body.style.overflow = "";
}

function step(d) {
  const idx = lessons.findIndex(x => x.id === currentId) + d;
  if (idx >= 0 && idx < lessons.length) openModal(lessons[idx].id);
}

$("closeModal").onclick = closeModal;
$("prevLesson").onclick = () => step(-1);
$("nextLesson").onclick = () => step(1);
$("doneLesson").onclick = () => {
  const adding = !done.has(currentId);
  if (adding) done.add(currentId); else done.delete(currentId);
  saveDone(); refreshDoneBtn(); updateProgress(); renderCards();
  if (adding && window.FX) {
    const r = $("doneLesson").getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top, 45);
    if (lessons.length && lessons.every(l => done.has(l.id))) { FX.celebrate(true); FX.toast("Semua materi selesai! Coba kuisnya sekarang 🎓"); }
    else FX.toast("Materi ditandai selesai ✓");
  }
};
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => {
  if (modal.hidden) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

/* ==========================================================
   KUIS (dengan penghitung benar/salah, timer, dan rekor terbaik)
   ========================================================== */
const quizEl = $("quiz");
const BEST_KEY = "ekobelajar-best";
let current = 0, score = 0, wrong = 0, quizStart = 0, quizTimer = 0;

const fmtTime = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
function readBest() {
  try {
    const b = JSON.parse(localStorage.getItem(BEST_KEY) || "null");
    if (b && Number.isFinite(b.score) && Number.isFinite(b.ms) && b.total === questions.length) return b;
  } catch (e) {}
  return null;
}
function saveBest(b) { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) {} }
function stopTimer() { clearInterval(quizTimer); quizTimer = 0; }
function tick() { const t = $("qTimer"); if (t) t.textContent = fmtTime(Date.now() - quizStart); }
function pop(el) { if (!el) return; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }

function showIntro() {
  stopTimer();
  if (!questions.length) { quizEl.innerHTML = '<p class="info">Belum ada soal kuis.</p>'; return; }
  const best = readBest();
  quizEl.innerHTML = `
    <div class="quiz-intro">
      <div class="qi-icon" aria-hidden="true">🎯</div>
      <h3>Siap menguji pemahamanmu?</h3>
      <p class="info">${questions.length} soal pilihan ganda · waktu dihitung</p>
      ${best ? `<p class="best">🏆 Rekor terbaik: ${best.score}/${best.total} dalam ${fmtTime(best.ms)}</p><br>` : ""}
      <button class="next" id="startQuiz">Mulai kuis</button>
    </div>`;
  $("startQuiz").onclick = startQuiz;
}

function startQuiz() {
  current = 0; score = 0; wrong = 0; quizStart = Date.now();
  stopTimer(); quizTimer = setInterval(tick, 500);
  renderQuestion();
}

function showResult() {
  stopTimer();
  const ms = Date.now() - quizStart, total = questions.length;
  const pct = Math.round(score / total * 100);
  const msg = pct === 100 ? "Sempurna, semua benar!" : pct >= 60 ? "Bagus, terus belajar!" : "Baca ulang materinya, lalu coba lagi";
  const old = readBest();
  const isBest = !old || score > old.score || (score === old.score && ms < old.ms);
  if (isBest) saveBest({ score, total, ms });
  const best = isBest ? { score, ms, total } : old;
  quizEl.innerHTML = `
    <div class="result">
      <h3>Kuis selesai</h3>
      <div class="big"><span id="scoreNum">0</span> / ${total}</div>
      <div class="quiz-stats center">
        <span class="chip ok">✓ ${score} benar</span>
        <span class="chip bad">✕ ${wrong} salah</span>
        <span class="chip">⏱ ${fmtTime(ms)}</span>
      </div>
      <p>${msg}</p>
      ${isBest && score > 0 ? `<p class="best">🏆 Rekor baru!</p>` : best ? `<p class="best">🏆 Rekor terbaik: ${best.score}/${best.total} · ${fmtTime(best.ms)}</p>` : ""}<br>
      <button class="next" id="retry">Ulangi kuis</button>
    </div>`;
  $("retry").onclick = startQuiz;
  // hitung naik dari 0 sampai skor akhir
  const el = $("scoreNum");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || score === 0) el.textContent = score;
  else {
    const t0 = performance.now(), dur = 700;
    (function up(t) {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(score * k);
      if (k < 1) requestAnimationFrame(up);
    })(t0);
  }
  if (pct >= 60 && window.FX) setTimeout(() => FX.celebrate(pct === 100), 250);
  if (pct === 100 && window.FX) FX.toast("Sempurna! Semua jawaban benar 🎉");
}

function renderQuestion() {
  if (current >= questions.length) return showResult();

  const item = questions[current];
  quizEl.innerHTML = `
    <div class="quiz-bar"><div style="width:${current / questions.length * 100}%"></div></div>
    <div class="quiz-stats">
      <span class="chip ok">✓ <b id="qOk">${score}</b> benar</span>
      <span class="chip bad">✕ <b id="qBad">${wrong}</b> salah</span>
      <span class="chip">⏱ <b id="qTimer">${fmtTime(Date.now() - quizStart)}</b></span>
    </div>
    <div class="info">Soal ${current + 1} dari ${questions.length}</div>
    <h3>${esc(item.q)}</h3>
    <div id="opts"></div>
    <p id="why" class="info" hidden></p>
    <button class="next" id="next" hidden>${current === questions.length - 1 ? "Lihat Hasil" : "Lanjut"}</button>`;

  const opts = $("opts");
  const nextBtn = $("next");

  item.options.forEach((text, i) => {
    const b = document.createElement("button");
    b.className = "option";
    b.textContent = text;
    b.onclick = () => {
      const all = opts.querySelectorAll(".option");
      all.forEach(x => x.disabled = true);
      all[item.answer].classList.add("correct");
      if (i === item.answer) {
        score++; $("qOk").textContent = score; pop($("qOk").parentNode);
        if (window.FX) { const r = b.getBoundingClientRect(); FX.burst(r.left + 24, r.top + r.height / 2, 22); }
      } else {
        wrong++; $("qBad").textContent = wrong; pop($("qBad").parentNode);
        b.classList.add("wrong");
      }
      if (item.why) { $("why").textContent = "Penjelasan: " + item.why; $("why").hidden = false; }
      nextBtn.hidden = false;
      nextBtn.focus({ preventScroll: true });
    };
    opts.appendChild(b);
  });

  nextBtn.onclick = () => { current++; renderQuestion(); };
}

/* ==========================================================
   INISIALISASI
   ========================================================== */
$("year").textContent = new Date().getFullYear();
updateProgress();
renderFilters();
renderCards();
showIntro();

/* Konten bersama dari server (Firestore): ditampilkan dulu dari cache, lalu diperbarui bila ada yang baru */
if (remoteEnabled()) {
  fetchRemote().then(r => {
    if (!r.ok) return;
    const m = mergedData();
    const same = JSON.stringify([m.lessons, m.questions]) === JSON.stringify([lessons, questions]);
    if (same) return;
    lessons = m.lessons; questions = m.questions;
    updateProgress(); renderFilters(); renderCards();
    if (!quizTimer) showIntro();            // jangan ganggu kuis yang sedang berjalan
  });
}

/* ==========================================================
   PROFIL: muncul saat di-scroll + efek miring mengikuti kursor
   ========================================================== */
document.documentElement.classList.add("js");
(function () {
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.25 });
    items.forEach(el => io.observe(el));
  } else items.forEach(el => el.classList.add("in"));

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".member").forEach(el => {
    el.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 12 + "deg");
      el.style.setProperty("--rx", -((e.clientY - r.top) / r.height - 0.5) * 12 + "deg");
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });
})();

/* ==========================================================
   MODE GELAP
   ========================================================== */
const themeBtn = $("themeBtn");
function applyTheme(t, save) {
  document.documentElement.setAttribute("data-theme", t);
  themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
  themeBtn.setAttribute("aria-pressed", String(t === "dark"));
  const label = t === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap";
  themeBtn.setAttribute("aria-label", label); themeBtn.title = label;
  if (save) { try { localStorage.setItem("ekobelajar-theme", t); } catch (e) {} }
}
applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
themeBtn.onclick = () => {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  setTimeout(() => root.classList.remove("theme-anim"), 450);
};

/* ==========================================================
   KODE QR (membuka website di HP)
   ========================================================== */
// Opsional: isi dengan alamat website online agar QR selalu menuju alamat ini,
// mis. "https://nama-project.vercel.app". Kosongkan untuk memakai alamat halaman yang sedang dibuka.
const SITE_URL = "";

const qrModal = $("qrModal");
function currentSiteUrl() {
  if (SITE_URL) return SITE_URL;
  if (/^https?:$/.test(location.protocol)) return location.href.split("#")[0].split("?")[0];
  return "";
}
function openQR() {
  const url = currentSiteUrl();
  const box = $("qrBox"), warn = $("qrWarn");
  box.innerHTML = ""; warn.hidden = true;
  $("qrUrl").textContent = url;
  if (!url) {
    warn.textContent = "Website sedang dibuka dari file di komputer, jadi belum punya alamat online. Buka lewat alamat Vercel, atau isi SITE_URL di script.js.";
    warn.hidden = false;
  } else {
    try {
      const q = qrcode(0, "M"); q.addData(url); q.make();
      box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 4, scalable: true, alt: "Kode QR menuju website EkoBelajar" });
    } catch (e) { warn.textContent = "Kode QR gagal dibuat. Alamat terlalu panjang?"; warn.hidden = false; }
    if (!SITE_URL && /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname)) {
      warn.textContent = "Alamat ini (localhost) hanya bisa dibuka di komputer ini. Agar bisa dipindai HP, buka website lewat alamat online atau isi SITE_URL di script.js.";
      warn.hidden = false;
    }
  }
  qrModal.hidden = false; document.body.style.overflow = "hidden";
  $("closeQR").focus();
}
function closeQR() { qrModal.hidden = true; document.body.style.overflow = ""; }
document.querySelectorAll(".qr-open").forEach(b => b.onclick = openQR);
$("closeQR").onclick = closeQR;
qrModal.addEventListener("click", e => { if (e.target === qrModal) closeQR(); });
document.addEventListener("keydown", e => { if (!qrModal.hidden && e.key === "Escape") closeQR(); });
$("qrCopy").onclick = () => {
  const url = currentSiteUrl();
  if (!url) return FX.toast("Belum ada alamat untuk disalin");
  const ok = () => FX.toast("Tautan disalin ✓"), fail = () => FX.toast("Gagal menyalin. Salin manual dari teks di atas");
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(ok, fail); else fail();
};