/* Tab "Pengunjung" di dashboard admin: membaca catatan aktivitas dari Firestore (hanya admin yang login). */
(function () {
  const LABEL = { masuk: "Masuk", materi: "Materi selesai", kuis: "Kuis", sertifikat: "Sertifikat" };
  let rows = [];
  const fmt = d => d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  async function load() {
    const msgEl = $("visMsg"), s = readSession();
    if (!FB || !FB.projectId) { msgEl.textContent = "Isi projectId di config.js agar pencatatan pengunjung aktif."; return; }
    if (!s) { msgEl.textContent = "Sesi habis. Silakan login ulang."; return; }
    msgEl.textContent = "Memuat...";
    try {
      const res = await fetch("https://firestore.googleapis.com/v1/projects/" + encodeURIComponent(FB.projectId) + "/databases/(default)/documents:runQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + s.t },
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "aktivitas" }], orderBy: [{ field: { fieldPath: "waktu" }, direction: "DESCENDING" }], limit: 1000 } })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(data)) {
        const code = data && data.error && data.error.status;
        msgEl.textContent = code === "PERMISSION_DENIED" ? "Akses ditolak. Periksa aturan Firestore (firestore.rules)." :
          code === "NOT_FOUND" || (data && data.error && /not.*exist|disabled/i.test(data.error.message || "")) ? "Firestore belum dibuat/diaktifkan di proyek ini." : "Gagal memuat data (" + (code || res.status) + ").";
        return;
      }
      rows = data.filter(x => x.document).map(x => {
        const f = x.document.fields || {}, v = k => (f[k] && (f[k].stringValue || f[k].timestampValue)) || "";
        return { t: new Date(v("waktu")), nama: v("nama"), kelas: v("kelas"), jenis: v("jenis"), detail: v("detail"), vid: v("vid") };
      });
      msgEl.textContent = rows.length ? "" : "Belum ada pengunjung tercatat.";
      draw();
    } catch (e) { msgEl.textContent = "Tidak bisa terhubung ke server."; }
  }

  function filtered() {
    const q = $("visSearch").value.trim().toLowerCase(), t = $("visType").value;
    return rows.filter(r => (!t || r.jenis === t) && (!q || (r.nama + " " + r.kelas).toLowerCase().includes(q)));
  }

  function draw() {
    const list = filtered();
    const uniq = new Set(rows.map(r => r.vid || r.nama)).size;
    const cert = new Set(rows.filter(r => r.jenis === "sertifikat").map(r => r.vid || r.nama)).size;
    $("visStats").innerHTML = [[uniq, "Pengunjung"], [rows.filter(r => r.jenis === "kuis").length, "Kuis dikerjakan"], [cert, "Sudah klaim sertifikat"]]
      .map(([n, l]) => `<div class="ad-stat"><b>${n}</b><span>${l}</span></div>`).join("");
    $("visBody").innerHTML = list.map(r => `<tr><td>${esc(isNaN(r.t) ? "" : fmt(r.t))}</td><td><b>${esc(r.nama)}</b></td><td>${esc(r.kelas)}</td><td><span class="vis-tag ${esc(r.jenis)}">${esc(LABEL[r.jenis] || r.jenis)}</span></td><td>${esc(r.detail)}</td></tr>`).join("");
  }

  // Cegah rumus Excel/Sheets dari nama yang diawali = + - @
  const csvCell = v => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  function csv() {
    const list = filtered();
    if (!list.length) return;
    const lines = [["Waktu", "Nama", "Kelas/NIM", "Aktivitas", "Detail"].map(csvCell).join(",")]
      .concat(list.map(r => [isNaN(r.t) ? "" : r.t.toISOString(), r.nama, r.kelas, LABEL[r.jenis] || r.jenis, r.detail].map(csvCell).join(",")));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    a.download = "pengunjung-ekobelajar.csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  $("visSearch").oninput = draw; $("visType").onchange = draw;
  $("visRefresh").onclick = load; $("visCsv").onclick = csv;
  document.querySelector('#tabs button[data-tab="visitors"]').addEventListener("click", load);
})();
