/* Pencatat pengunjung (Firebase Firestore lewat REST, tanpa library).
   Aktif hanya jika projectId di config.js terisi. Pengunjung diminta mengisi nama sekali, lalu
   aktivitasnya (masuk, materi selesai, kuis, sertifikat) dicatat dan bisa dilihat admin di dashboard. */
(function () {
  const C = window.FIREBASE_CONFIG || {};
  const ON = !!(C.apiKey && C.projectId);
  const KEY = "ekobelajar-visitor";
  let who = null;
  try { who = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (who && (typeof who.nama !== "string" || !who.nama || typeof who.id !== "string")) who = null;

  const clean = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n);
  const newId = () => { try { return crypto.randomUUID(); } catch (e) { return String(Date.now()) + Math.random().toString(36).slice(2, 8); } };

  function send(jenis, detail) {
    if (!ON || !who) return;
    const url = "https://firestore.googleapis.com/v1/projects/" + encodeURIComponent(C.projectId) +
      "/databases/(default)/documents/aktivitas?key=" + encodeURIComponent(C.apiKey);
    const f = {
      nama: { stringValue: who.nama }, kelas: { stringValue: who.kelas || "" }, vid: { stringValue: who.id },
      jenis: { stringValue: jenis }, detail: { stringValue: clean(detail, 120) },
      waktu: { timestampValue: new Date().toISOString() }
    };
    try { fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: f }), keepalive: true }).catch(() => {}); } catch (e) {}
  }

  function logEntry() {
    try { if (sessionStorage.getItem("ekobelajar-entered")) return; sessionStorage.setItem("ekobelajar-entered", "1"); } catch (e) {}
    send("masuk", "");
  }

  function askName() {
    const m = document.createElement("div");
    m.className = "modal gate-modal";
    m.innerHTML =
      '<div class="modal-box gate-box" role="dialog" aria-modal="true" aria-labelledby="gateTitle"><div class="modal-pad">' +
      '<h3 id="gateTitle" class="cert-h">Selamat datang di EkoBelajar 👋</h3>' +
      '<p class="qr-sub">Isi namamu dulu sebelum mulai belajar.</p>' +
      '<form id="gateForm" class="gate-form" autocomplete="off">' +
      '<label for="gateName">Nama lengkap</label><input id="gateName" type="text" maxlength="40" required placeholder="Nama lengkap">' +
      '<label for="gateKelas">Kelas / NIM <span class="gate-opt">(opsional)</span></label><input id="gateKelas" type="text" maxlength="30" placeholder="mis. 2025 A atau NIM">' +
      '<p id="gateErr" class="qr-warn" hidden>Nama belum diisi.</p>' +
      '<button type="submit" class="next">Mulai belajar</button>' +
      '<p class="info gate-note">Nama dan aktivitas belajarmu (masuk, materi, kuis, sertifikat) dicatat oleh pengelola untuk memantau pembelajaran.</p>' +
      '</form></div></div>';
    document.body.appendChild(m);
    document.body.style.overflow = "hidden";
    const nameEl = m.querySelector("#gateName");
    nameEl.focus();
    m.querySelector("#gateForm").onsubmit = e => {
      e.preventDefault();
      const nama = clean(nameEl.value, 40);
      if (!nama) { m.querySelector("#gateErr").hidden = false; nameEl.focus(); return; }
      who = { id: newId(), nama, kelas: clean(m.querySelector("#gateKelas").value, 30) };
      try { localStorage.setItem(KEY, JSON.stringify(who)); } catch (e) {}
      m.remove(); document.body.style.overflow = "";
      logEntry();
    };
  }

  window.Track = {
    enabled: ON,
    name: () => (who ? who.nama : ""),
    log: send,
    forget: () => { who = null; try { localStorage.removeItem(KEY); } catch (e) {} }   // pakai: Track.forget() lalu muat ulang
  };

  if (ON) { if (who) logEntry(); else askName(); }
})();
