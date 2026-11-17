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
   8. KONTEN BERSAMA (agar materi/soal dari dashboard tampil untuk semua pengunjung):
      a. Firebase console -> Build -> Firestore Database -> Create database (mode production, lokasi bebas).
      b. Tab "Rules", ganti isinya dengan (ganti EMAIL_ADMIN dengan email admin asli), lalu Publish:
           rules_version = '2';
           service cloud.firestore {
             match /databases/{database}/documents {
               match /konten/{doc} {
                 allow read: if true;
                 allow write: if request.auth != null && request.auth.token.email == "EMAIL_ADMIN";
               }
             }
           }
      c. Salin "Project ID" (Project settings -> General) ke projectId di bawah.
      d. Google Cloud Console -> Credentials -> API key tadi -> "API restrictions": izinkan juga "Cloud Firestore API"
         (selain Identity Toolkit API).
      Selama projectId kosong, konten tambahan tetap tersimpan di browser admin saja (mode lama).
   9. Upload config.js, index.html, script.js, data.js, admin.html, admin.js ke hosting. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBSj_7rZ6nT47UV2ScycydDk_CtoGH0pKE",       // contoh: "AIzaSy..."
  projectId: "ekobelajar-53764",   // contoh: "ekobelajar-12345" (Project ID Firebase, bukan API key)
  adminEmailHash: "6f30d5a548aa6502d539b22cce28175059db974df410c67841107b178afddb68"   // SHA-256 email admin
};

/* Email untuk saran dan umpan balik, ditampilkan di bagian Tentang pada website.
   Kosongkan ("") jika tidak ingin menampilkan bagian kontak. */
window.CONTACT_EMAIL = "";