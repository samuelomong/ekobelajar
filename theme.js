/* Menerapkan tema (terang/gelap) sebelum halaman digambar agar tidak berkedip.
   Bawaan: terang. Pilihan pengunjung disimpan dan dipakai lagi di kunjungan berikutnya. */
(function () {
  var t = "light";
  try { var s = localStorage.getItem("ekobelajar-theme"); if (s === "dark" || s === "light") t = s; } catch (e) {}
  document.documentElement.setAttribute("data-theme", t);
})();
