/* ==========================================================
   DASHBOARD ADMIN
   Login dan ganti kata sandi memakai Firebase Authentication (lihat config.js).
   Kata sandi tersimpan di server, jadi berlaku sama di semua perangkat.
   ========================================================== */
const $ = id => document.getElementById(id);
const SESSION_KEY = "ekobelajar-admin-ok";

/* ---------- Mode server: Firebase Authentication ----------
   Aktif jika apiKey di config.js terisi. Kata sandi disimpan di server Firebase,
   jadi begitu diganti langsung berlaku di semua perangkat (tanpa unduh/timpa file). */
const FB = (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) ? window.FIREBASE_CONFIG : null;
const EMAIL_KEY = "ekobelajar-admin-email";
const FB_ERR = {
  INVALID_LOGIN_CREDENTIALS: "Email atau kata sandi salah.",
  INVALID_PASSWORD: "Email atau kata sandi salah.",
  EMAIL_NOT_FOUND: "Email atau kata sandi salah.",
  INVALID_EMAIL: "Format email tidak valid.",
  MISSING_PASSWORD: "Kata sandi belum diisi.",
  USER_DISABLED: "Akun ini dinonaktifkan di Firebase.",
  TOO_MANY_ATTEMPTS_TRY_LATER: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  WEAK_PASSWORD: "Kata sandi terlalu lemah (minimal 6 karakter).",
  OPERATION_NOT_ALLOWED: "Login Email/Password belum diaktifkan di Firebase."
};
async function fbCall(action, body) {
  let res;
  try {
    res = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:" + action + "?key=" + encodeURIComponent(FB.apiKey), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
  } catch (e) { throw new Error("Tidak bisa terhubung ke server. Periksa koneksi internet."); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = (data.error && data.error.message) || "";
    if (/api key/i.test(raw)) throw new Error("API key Firebase tidak valid. Periksa isi config.js.");
    const code = raw.split(" ")[0];
    throw new Error(FB_ERR[code] || "Gagal (" + (code || res.status) + ").");
  }
  return data;
}
async function fbSignIn(email, password) {
  const d = await fbCall("signInWithPassword", { email, password, returnSecureToken: true });
  if (FB.adminEmail && String(d.email).toLowerCase() !== FB.adminEmail.toLowerCase()) throw new Error("Akun ini bukan admin.");
  return d;
}
if (FB) {
  $("emailWrap").hidden = false; $("loginEmail").required = true; $("loginEmail").value = FB.adminEmail || "";
} else {
  $("loginMsg").textContent = "Login belum aktif: isi apiKey Firebase di file config.js, lalu deploy ulang.";
  $("loginMsg").hidden = false; $("loginBtn").disabled = true;
}

let fails = 0, lockUntil = 0;
function isLoggedIn() { try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { return false; } }

$("loginForm").onsubmit = async e => {
  e.preventDefault();
  if (!FB) return;
  const m = $("loginMsg");
  const show = t => { m.textContent = t; m.hidden = false; };
  const wait = Math.ceil((lockUntil - Date.now()) / 1000);
  if (wait > 0) return show(`Terlalu banyak percobaan. Coba lagi dalam ${wait} detik.`);
  const email = $("loginEmail").value.trim();
  let ok = false, err = "Email atau kata sandi salah.";
  $("loginBtn").disabled = true; $("loginBtn").textContent = "Memeriksa...";
  try { await fbSignIn(email, $("loginPass").value); ok = true; try { sessionStorage.setItem(EMAIL_KEY, email); } catch (x) {} }
  catch (x) { err = x.message; }
  $("loginBtn").disabled = false; $("loginBtn").textContent = "Masuk";
  if (ok) {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (x) {}
    $("loginPass").value = ""; m.hidden = true; fails = 0;
    showApp();
  } else {
    fails++;
    if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; err = "Terlalu banyak percobaan. Tunggu 30 detik."; }
    show(err); $("loginPass").select();
  }
};
$("logoutBtn").onclick = () => { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {} location.reload(); };

/* ---------- Data kerja admin ---------- */
let custom = loadCustom();
// Jika draf lokal kosong tapi sudah ada konten.js terpublikasi, jadikan titik awal
if (!custom.lessons.length && !custom.questions.length) {
  const p = publishedData();
  if (p.lessons.length || p.questions.length) { custom = JSON.parse(JSON.stringify(p)); saveCustom(custom); }
}
function persist() {
  if (saveCustom(custom)) return true;
  msg("Gagal menyimpan (penyimpanan penuh/diblokir). Coba foto yang lebih kecil atau ekspor cadangan.", true);
  return false;
}

function msg(t, bad) {
  const m = $("adMsg");
  m.textContent = t; m.hidden = !t; m.className = "ad-msg" + (bad ? " bad" : "");
  if (t) { clearTimeout(msg.t); msg.t = setTimeout(() => (m.hidden = true), 4500); window.scrollTo({ top: 0, behavior: "smooth" }); }
}

function fileToDataURL(file, maxW = 800) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const k = Math.min(1, maxW / img.width);
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

/* ---------- Tab ---------- */
document.querySelectorAll("#tabs button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#tabs button").forEach(x => x.classList.toggle("active", x === b));
  document.querySelectorAll("[data-pane]").forEach(p => p.hidden = p.dataset.pane !== b.dataset.tab);
});

/* ---------- Tampilan daftar & statistik ---------- */
function render() {
  const m = mergedDataFrom(custom);
  $("stats").innerHTML = [
    [m.lessons.length, "Total materi"], [custom.lessons.length, "Materi tambahan"],
    [m.questions.length, "Total soal"], [custom.questions.length, "Soal tambahan"]
  ].map(([n, l]) => `<div class="ad-stat"><b>${n}</b><span>${l}</span></div>`).join("");

  $("topicList").innerHTML = [...new Set(m.lessons.map(l => l.topic))].map(t => `<option value="${esc(t)}">`).join("");

  $("lessonList").innerHTML =
    custom.lessons.map(l => `
      <div class="ad-item"><span><b>${esc(l.title)}</b><span class="ad-tag new">Tambahan</span> <small>· ${esc(l.topic)}${l.video ? " · video" : ""}</small></span>
      <span><button data-edit="${l.id}">Edit</button><button class="ad-danger" data-del-lesson="${l.id}">Hapus</button></span></div>`).join("") +
    baseLessons.map(l => `
      <div class="ad-item"><span>${esc(l.icon)} <b>${esc(l.title)}</b><span class="ad-tag">Bawaan</span> <small>· ${esc(l.topic)}</small></span></div>`).join("");

  $("quizList").innerHTML =
    custom.questions.map((q, i) => `
      <div class="ad-item"><span>${esc(q.q)}<span class="ad-tag new">Tambahan</span></span>
      <span><button data-edit-q="${i}">Edit</button><button class="ad-danger" data-del-q="${i}">Hapus</button></span></div>`).join("") +
    baseQuestions.map(q => `
      <div class="ad-item"><span>${esc(q.q)}<span class="ad-tag">Bawaan</span></span></div>`).join("");
}
function mergedDataFrom(c) {
  return { lessons: [...baseLessons, ...c.lessons], questions: [...baseQuestions, ...c.questions] };
}

/* ---------- Form materi ---------- */
function resetLessonForm() {
  $("lessonForm").reset();
  $("lfId").value = ""; $("lfMin").value = 3;
  $("lfSubmit").textContent = "Tambah Materi"; $("lfCancel").hidden = true;
  $("lfHeading").textContent = "Tambah Materi Baru";
}
$("lfCancel").onclick = resetLessonForm;

$("lessonForm").onsubmit = async e => {
  e.preventDefault();
  const title = $("lfTitle").value.trim();
  const topic = $("lfTopic").value.trim();
  const raw = $("lfContent").value;
  if (!title || !topic || !raw.trim()) return msg("Judul, topik, dan isi materi wajib diisi.", true);

  const vidRaw = $("lfVideo").value.trim();
  const vid = parseYouTubeId(vidRaw);
  if (vidRaw && !vid) return msg("Link YouTube tidak dikenali. Tempel link lengkap videonya.", true);

  const id = $("lfId").value ? Number($("lfId").value) : Date.now();
  const old = custom.lessons.find(x => x.id === id);

  let image = $("lfImgUrl").value.trim();
  const file = $("lfFile").files[0];
  if (file) {
    try { image = await fileToDataURL(file); } catch (err) { return msg("Foto tidak bisa dibaca.", true); }
  }
  if (!image && old && old.userImage) image = old.image;      // pertahankan foto lama saat edit
  const userImage = !!image;
  if (!image && vid) image = yt(vid);

  const lesson = {
    id, custom: true, title, topic,
    summary: $("lfSummary").value.trim() || title,
    icon: old && old.icon ? old.icon : "📘",
    color: old ? old.color : PALETTE[Math.floor(Math.random() * PALETTE.length)],
    image: image || null, userImage,
    video: vid ? { type: "youtube", id: vid } : null,
    minutes: Math.max(1, Number($("lfMin").value) || 3),
    raw, rawPoints: $("lfPoints").value,
    content: textToHTML(raw),
    points: $("lfPoints").value.split("\n").map(s => s.trim()).filter(Boolean)
  };
  const backup = JSON.stringify(custom);
  if (old) custom.lessons[custom.lessons.indexOf(old)] = lesson; else custom.lessons.push(lesson);
  if (!persist()) { custom = JSON.parse(backup); return; }
  msg(old ? "Materi diperbarui" : "Materi ditambahkan");
  resetLessonForm(); render();
};

$("lessonList").onclick = e => {
  const ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del-lesson]");
  if (ed) {
    const l = custom.lessons.find(x => x.id === Number(ed.dataset.edit)); if (!l) return;
    $("lfId").value = l.id; $("lfTitle").value = l.title; $("lfTopic").value = l.topic;
    $("lfMin").value = l.minutes; $("lfSummary").value = l.summary;
    $("lfVideo").value = l.video ? "https://www.youtube.com/watch?v=" + l.video.id : "";
    $("lfImgUrl").value = l.userImage && !String(l.image).startsWith("data:") ? l.image : "";
    $("lfContent").value = l.raw || ""; $("lfPoints").value = l.rawPoints || "";
    $("lfSubmit").textContent = "Simpan perubahan"; $("lfCancel").hidden = false;
    $("lfHeading").textContent = "Edit Materi";
    $("lfHeading").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (del && confirm("Hapus materi ini?")) {
    const id = Number(del.dataset.delLesson);
    custom.lessons = custom.lessons.filter(x => x.id !== id);
    persist(); render();
  }
};

/* ---------- Form kuis ---------- */
function buildQuizOpts(vals = [], correct = 0) {
  $("qfOpts").innerHTML = "ABCD".split("").map((L, i) => `
    <div class="ad-opt"><input type="radio" name="qfAns" value="${i}" ${i === correct ? "checked" : ""} title="Jawaban benar">
    <input class="qfOpt" placeholder="Pilihan ${L}${i < 2 ? " *" : ""}" value="${esc(vals[i] || "")}"></div>`).join("");
}
buildQuizOpts();
function resetQuizForm() {
  $("quizForm").reset(); $("qfIdx").value = ""; buildQuizOpts();
  $("qfSubmit").textContent = "Tambah Soal"; $("qfCancel").hidden = true; $("qfHeading").textContent = "Tambah Soal Kuis";
}
$("qfCancel").onclick = resetQuizForm;

$("quizForm").onsubmit = e => {
  e.preventDefault();
  const q = $("qfQ").value.trim();
  const inputs = [...document.querySelectorAll(".qfOpt")];
  const picked = Number(document.querySelector('input[name="qfAns"]:checked').value);
  const opts = [], map = {};
  inputs.forEach((inp, i) => { const v = inp.value.trim(); if (v) { map[i] = opts.length; opts.push(v); } });
  if (!q || opts.length < 2) return msg("Isi pertanyaan dan minimal 2 pilihan.", true);
  if (!(picked in map)) return msg("Pilihan yang ditandai sebagai jawaban benar masih kosong.", true);

  const item = { q, options: opts, answer: map[picked], why: $("qfWhy").value.trim(), custom: true };
  const backup = JSON.stringify(custom);
  const idx = $("qfIdx").value;
  if (idx !== "") custom.questions[Number(idx)] = item; else custom.questions.push(item);
  if (!persist()) { custom = JSON.parse(backup); return; }
  msg(idx !== "" ? "Soal diperbarui" : "Soal ditambahkan");
  resetQuizForm(); render();
};
$("quizList").onclick = e => {
  const ed = e.target.closest("[data-edit-q]"), d = e.target.closest("[data-del-q]");
  if (ed) {
    const i = Number(ed.dataset.editQ), q = custom.questions[i]; if (!q) return;
    $("qfIdx").value = i; $("qfQ").value = q.q; $("qfWhy").value = q.why || "";
    buildQuizOpts(q.options, q.answer);
    $("qfSubmit").textContent = "Simpan perubahan"; $("qfCancel").hidden = false; $("qfHeading").textContent = "Edit Soal";
    $("qfHeading").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (d && confirm("Hapus soal ini?")) { custom.questions.splice(Number(d.dataset.delQ), 1); persist(); resetQuizForm(); render(); }
};

/* ---------- Ganti kata sandi (Firebase) ---------- */
function renderPassStatus() {
  $("passStatus").className = "ad-status";
  $("passStatus").textContent = "Kata sandi tersimpan di server (Firebase) dan berlaku sama di semua perangkat.";
}
async function changeFbPassword() {
  if ($("pwNew").value.length < 6) return msg("Kata sandi baru minimal 6 karakter.", true);
  if ($("pwNew").value !== $("pwNew2").value) return msg("Pengulangan kata sandi tidak sama.", true);
  let email = ""; try { email = sessionStorage.getItem(EMAIL_KEY) || ""; } catch (x) {}
  try {
    const d = await fbSignIn(email, $("pwOld").value);          // pastikan kata sandi lama benar
    await fbCall("update", { idToken: d.idToken, password: $("pwNew").value, returnSecureToken: true });
  } catch (x) {
    return msg(x.message === "Email atau kata sandi salah." ? "Kata sandi saat ini salah." : x.message, true);
  }
  $("passForm").reset();
  msg("Kata sandi berhasil diganti. Langsung berlaku di semua perangkat; kata sandi lama tidak bisa dipakai lagi.");
}
$("passForm").onsubmit = e => { e.preventDefault(); changeFbPassword(); };

/* ---------- Mulai ---------- */
function showApp() {
  $("login").hidden = true; $("app").hidden = false;
  renderPassStatus();
  render();
}
if (isLoggedIn()) showApp();