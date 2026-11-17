/* Pengaturan login admin lewat Firebase Authentication (gratis).
   Selama apiKey kosong, dashboard memakai mode lama (auth.js, hanya berlaku per perangkat).

   Cara setup (sekitar 5 menit):
   1. Buka https://console.firebase.google.com  ->  Add project (Google Analytics boleh dimatikan).
   2. Build -> Authentication -> Get started -> tab "Sign-in method" -> aktifkan "Email/Password".
   3. Tab "Users" -> Add user -> isi email dan kata sandi untuk admin.
   4. Authentication -> Settings -> User actions -> matikan "Enable create (sign-up)" agar orang lain tidak bisa mendaftar.
   5. Project settings (ikon roda gigi) -> General -> salin "Web API Key" ke apiKey di bawah.
   6. Isi adminEmailHash dengan hash SHA-256 dari email admin (huruf kecil). Email asli tidak ditulis di sini
      supaya tidak terlihat publik. Cara membuat hash: buka console browser (F12), lalu jalankan:
        crypto.subtle.digest("SHA-256", new TextEncoder().encode("email@admin.com"))
          .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,"0")).join("")))
   7. Google Cloud Console -> APIs & Services -> Credentials -> klik API key tersebut -> "Website restrictions",
      isi domain website Anda saja. Batasi juga ke "Identity Toolkit API".
   8. Upload config.js, admin.html, admin.js ke hosting.

   PENCATATAN PENGUNJUNG (nama pengunjung terlihat di dashboard admin, tab "Pengunjung"):
   a. Firebase Console -> Build -> Firestore Database -> Create database (mode produksi).
   b. Tab "Rules": tempel isi file firestore.rules, lalu Publish.
   c. Isi projectId di bawah dengan Project ID proyek Firebase Anda.
   Selama projectId kosong, pencatatan dan formulir nama nonaktif. */
window.FIREBASE_CONFIG = {
  projectId: "",                                          // ID proyek Firebase (Project settings -> General -> Project ID). Isi agar pencatatan pengunjung aktif.
  apiKey: "AIzaSyBSj_7rZ6nT47UV2ScycydDk_CtoGH0pKE",       // contoh: "AIzaSy..."
  adminEmailHash: "6f30d5a548aa6502d539b22cce28175059db974df410c67841107b178afddb68"   // SHA-256 email admin
};