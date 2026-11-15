/* Efek konfeti ringan (tanpa library). Otomatis nonaktif jika pengguna memilih "kurangi animasi". */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLORS = ["#f4c20d", "#a62b4b", "#4b44b8", "#22c55e", "#38bdf8", "#ffffff", "#f97316"];
  let cv = null, ctx = null, parts = [], raf = 0, W = 0, H = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function ensure() {
    if (cv) return;
    cv = document.createElement("canvas");
    cv.className = "fx-canvas"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    ctx = cv.getContext("2d");
    resize(); addEventListener("resize", resize);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  function add(x, y, angle, speed, extra) {
    const coin = Math.random() < 0.22;
    parts.push(Object.assign({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      s: rnd(6, 11), rot: rnd(0, 6.28), vr: rnd(-0.3, 0.3), tilt: rnd(0, 6.28),
      color: coin ? "#f4c20d" : COLORS[(Math.random() * COLORS.length) | 0], coin, life: 0, max: rnd(110, 170)
    }, extra || {}));
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter(p => p.life < p.max && p.y < H + 30);
    for (const p of parts) {
      p.life++; p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.32;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.tilt += 0.18;
      ctx.globalAlpha = Math.min(1, (p.max - p.life) / 30);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
      if (p.coin) {
        ctx.scale(Math.abs(Math.cos(p.tilt)) * 0.8 + 0.2, 1);
        ctx.beginPath(); ctx.arc(0, 0, p.s * 0.6, 0, 6.283); ctx.fill();
        ctx.strokeStyle = "#b58900"; ctx.lineWidth = 1.5; ctx.stroke();
      } else {
        ctx.scale(1, Math.abs(Math.cos(p.tilt)) * 0.8 + 0.2);
        ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = 0; ctx.clearRect(0, 0, W, H); }
  }
  function start() { if (!raf) raf = requestAnimationFrame(loop); }

  window.FX = {
    // Letusan kecil dari satu titik layar (mis. dari tombol)
    burst(x, y, n) {
      if (reduce) return; ensure();
      for (let i = 0; i < (n || 40); i++) add(x, y, rnd(-Math.PI * 0.95, -Math.PI * 0.05), rnd(4, 11));
      start();
    },
    // Perayaan: dua "meriam" dari sudut bawah; big = ditambah hujan koin dari atas
    celebrate(big) {
      if (reduce) return; ensure();
      const n = big ? 90 : 55;
      for (let i = 0; i < n; i++) {
        add(0, H, rnd(-1.35, -0.75), rnd(11, 21));
        add(W, H, rnd(-2.4, -1.8), rnd(11, 21));
      }
      if (big) for (let i = 0; i < 70; i++) add(rnd(0, W), rnd(-H * 0.5, -10), Math.PI / 2, rnd(1, 4), { max: 260 });
      start();
    },
    toast(msg) {
      const t = document.createElement("div");
      t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2900);
    }
  };
})();
