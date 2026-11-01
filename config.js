/* Pengaturan login admin lewat Firebase Authentication (gratis).
   Selama apiKey kosong, dashboard memakai mode lama (auth.js, hanya berlaku per perangkat).

   Cara setup (sekitar 5 menit):
   1. Buka https://console.firebase.google.com  ->  Add project (Google Analytics boleh dimatikan).
   2. Build -> Authentication -> Get started -> tab "Sign-in method" -> aktifkan "Email/Password".
   3. Tab "Users" -> Add user -> isi email dan kata sandi untuk admin.
   4. Authentication -> Settings -> User actions -> matikan "Enable create (sign-up)" agar orang lain tidak bisa mendaftar.
   5. Project settings (ikon roda gigi) -> General -> salin "Web API Key" ke apiKey di bawah.
   6. Isi adminEmail dengan email dari langkah 3, lalu upload config.js, admin.html, admin.js ke hosting. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBSj_7rZ6nT47UV2ScycydDk_CtoGH0pKE",       // contoh: "AIzaSy..."
  adminEmail: "julalroomong28@gmail.com"    // email admin dari langkah 3
};