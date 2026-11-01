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
  return `<div class="cover" style="--g:linear-gradient(135deg,${l.color[0]},${l.color[1]})"><span>${l.icon}</span></div>`;
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
    ? `<h4>Poin penting</h4><ul>${l.points.map(p => `<li>${p}</li>`).join("")}</ul>` : "";

  if (hasVideo(l) && l.video.type === "youtube") {
    modalMedia.innerHTML = `<div class="ratio"><iframe src="https://www.youtube.com/embed/${l.video.id}"
      title="${esc(l.title)}" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"></iframe></div>
      <a class="yt-link" href="https://www.youtube.com/watch?v=${l.video.id}" target="_blank" rel="noopener">Buka video di YouTube</a>`;
  } else if (hasVideo(l) && l.video.type === "file") {
    modalMedia.innerHTML = `<video controls src="${l.video.src}"></video>`;
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
  if (done.has(currentId)) done.delete(currentId); else done.add(currentId);
  saveDone(); refreshDoneBtn(); updateProgress(); renderCards();
};
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => {
  if (modal.hidden) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

/* ==========================================================
   KUIS
   ========================================================== */
const quizEl = $("quiz");
let current = 0, score = 0;

function renderQuestion() {
  if (current >= questions.length) {
    const pct = Math.round(score / questions.length * 100);
    const msg = pct === 100 ? "Sempurna, semua benar!" : pct >= 60 ? "Bagus, terus belajar!" : "Baca ulang materinya, lalu coba lagi";
    quizEl.innerHTML = `
      <div class="result">
        <h3>Kuis selesai</h3>
        <div class="big">${score} / ${questions.length}</div>
        <p>${msg}</p><br>
        <button class="next" id="retry">Ulangi kuis</button>
      </div>`;
    $("retry").onclick = () => { current = 0; score = 0; renderQuestion(); };
    return;
  }

  const item = questions[current];
  quizEl.innerHTML = `
    <div class="quiz-bar"><div style="width:${current / questions.length * 100}%"></div></div>
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
      if (i === item.answer) score++; else b.classList.add("wrong");
      if (item.why) { $("why").textContent = "Penjelasan: " + item.why; $("why").hidden = false; }
      nextBtn.hidden = false;
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
renderQuestion();

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