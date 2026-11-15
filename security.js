/* Perlindungan clickjacking: halaman ini tidak boleh dimuat di dalam frame situs lain.
   (Untuk perlindungan penuh, aktifkan juga header X-Frame-Options / frame-ancestors di hosting, lihat file _headers.) */
(function () {
  if (window.top !== window.self) {
    document.documentElement.style.display = "none";
    try { window.top.location.href = window.self.location.href; } catch (e) {}
  }
})();
