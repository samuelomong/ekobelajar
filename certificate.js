/* Pembuat sertifikat (gambar PNG) memakai <canvas>. Tanpa library, tanpa server. */
const CERT_CREDIT = "Dibuat oleh Karnia Rumbay, Virjin Tiow & Eugecia Rorimpandey";
const CERT_SERIF = '"Fraunces", Georgia, "Times New Roman", serif';
const CERT_SANS = '"Figtree", "Segoe UI", system-ui, sans-serif';

// Pastikan font dari Google Fonts sudah termuat sebelum menggambar (maks. 1,5 detik, lalu pakai font cadangan)
function certFontsReady() {
  if (!(document.fonts && document.fonts.load)) return Promise.resolve();
  const load = Promise.all([document.fonts.load('700 60px Fraunces'), document.fonts.load('600 30px Figtree')]).catch(() => {});
  return Promise.race([load, new Promise(r => setTimeout(r, 1500))]);
}

function drawCertificate(o) {
  const W = 1600, H = 1131, cx = W / 2;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");

  const text = (s, x, y, font, color, align) => {
    g.font = font; g.fillStyle = color; g.textAlign = align || "center"; g.textBaseline = "alphabetic";
    g.fillText(s, x, y);
  };
  const spaced = (px, fn) => { if ("letterSpacing" in g) g.letterSpacing = px + "px"; fn(); if ("letterSpacing" in g) g.letterSpacing = "0px"; };

  // latar + bingkai (navy, emas, marun)
  g.fillStyle = "#1f1b5c"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#fffdf6"; g.fillRect(28, 28, W - 56, H - 56);
  g.strokeStyle = "#f4c20d"; g.lineWidth = 6; g.strokeRect(48, 48, W - 96, H - 96);
  g.strokeStyle = "#a62b4b"; g.lineWidth = 2; g.strokeRect(64, 64, W - 128, H - 128);
  // hiasan sudut (belah ketupat emas)
  g.fillStyle = "#f4c20d";
  [[64, 64], [W - 64, 64], [64, H - 64], [W - 64, H - 64]].forEach(([x, y]) => {
    g.beginPath(); g.moveTo(x, y - 16); g.lineTo(x + 16, y); g.lineTo(x, y + 16); g.lineTo(x - 16, y); g.closePath(); g.fill();
  });

  // logo + nama kampus
  if (o.logo && o.logo.complete && o.logo.naturalWidth) {
    const h = 110, w = h * o.logo.naturalWidth / o.logo.naturalHeight;
    g.drawImage(o.logo, cx - w / 2, 92, w, h);
  }
  spaced(3, () => text((o.campusName || "").toUpperCase(), cx, 262, "700 34px " + CERT_SERIF, "#1f1b5c"));
  if (o.campusSub) text(o.campusSub, cx, 298, "500 24px " + CERT_SANS, "#62607f");

  // judul
  spaced(14, () => text("SERTIFIKAT", cx, 412, "700 100px " + CERT_SERIF, "#a62b4b"));
  spaced(6, () => text("PENYELESAIAN PEMBELAJARAN", cx, 464, "600 26px " + CERT_SANS, "#62607f"));

  // nama penerima (mengecil otomatis jika panjang; posisi garis dasar tetap)
  text("diberikan kepada", cx, 540, "italic 500 34px " + CERT_SERIF, "#62607f");
  let size = 118;
  g.font = "700 " + size + "px " + CERT_SERIF;
  while (g.measureText(o.name).width > 1150 && size > 50) { size -= 4; g.font = "700 " + size + "px " + CERT_SERIF; }
  text(o.name, cx, 655, "700 " + size + "px " + CERT_SERIF, "#1f1b5c");
  g.strokeStyle = "#f4c20d"; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 460, 702); g.lineTo(cx + 460, 702); g.stroke();

  // keterangan
  text("telah menyelesaikan seluruh materi dan kuis pada media belajar ekonomi", cx, 764, "500 33px " + CERT_SANS, "#1b1a33");
  text("EkoBelajar dengan skor " + o.score + " dari " + o.total + " soal", cx, 810, "700 33px " + CERT_SANS, "#1b1a33");

  // medali dengan pita
  const my = 912, r = 56;
  g.fillStyle = "#a62b4b"; g.beginPath(); g.moveTo(cx - 30, my + 36); g.lineTo(cx - 54, my + 100); g.lineTo(cx - 25, my + 88); g.lineTo(cx - 5, my + 106); g.lineTo(cx + 6, my + 46); g.closePath(); g.fill();
  g.fillStyle = "#1f1b5c"; g.beginPath(); g.moveTo(cx + 30, my + 36); g.lineTo(cx + 54, my + 100); g.lineTo(cx + 25, my + 88); g.lineTo(cx + 5, my + 106); g.lineTo(cx - 6, my + 46); g.closePath(); g.fill();
  g.fillStyle = "#f4c20d"; g.beginPath(); g.arc(cx, my, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#b58900"; g.lineWidth = 5; g.beginPath(); g.arc(cx, my, r, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(cx, my, r - 13, 0, Math.PI * 2); g.stroke();
  text("★", cx, my + 20, "700 54px " + CERT_SANS, "#a62b4b");

  // tanggal, nomor, kredit pembuat
  text("Tanggal", 190, 905, "600 20px " + CERT_SANS, "#62607f", "left");
  text(o.dateStr, 190, 942, "700 30px " + CERT_SERIF, "#1f1b5c", "left");
  text("Nomor", W - 190, 905, "600 20px " + CERT_SANS, "#62607f", "right");
  text(o.serial, W - 190, 942, "700 30px " + CERT_SERIF, "#1f1b5c", "right");
  text(CERT_CREDIT, cx, 1049, "500 21px " + CERT_SANS, "#62607f");

  // cap "CONTOH" miring untuk pratinjau (bukan sertifikat asli)
  if (o.preview) {
    g.save(); g.translate(cx, H / 2); g.rotate(-Math.PI / 9);
    g.globalAlpha = 0.13;
    spaced(24, () => text("CONTOH", 0, 60, "700 230px " + CERT_SANS, "#a62b4b"));
    g.restore();
  }
  return c;
}

// Mengembalikan data URL PNG. Jika canvas "tercemar" (mis. dibuka dari file://), ulangi tanpa logo.
function certToDataURL(o) {
  try { return drawCertificate(o).toDataURL("image/png"); }
  catch (e) { return drawCertificate(Object.assign({}, o, { logo: null })).toDataURL("image/png"); }
}