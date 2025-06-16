# Story App PWA - Final Submission Dicoding Web PWA Class

[![Netlify Status](https://api.netlify.com/api/v1/badges/b86cc203-bee2-49a9-b8c9-34c715b0b15b/deploy-status)](https://app.netlify.com/projects/gorgeous-ganache-520de5/deploys)

## Deskripsi Proyek

Ini adalah aplikasi web Progressive Web App (PWA) yang dibangun sebagai _final submission_ untuk kelas "Belajar Pengembangan Web Intermediate" dari Dicoding. Aplikasi ini memungkinkan pengguna untuk berbagi cerita, melihat daftar cerita dari pengguna lain, dan mengaksesnya bahkan dalam mode offline. Aplikasi ini juga mendukung fitur notifikasi push dan kemampuan instalasi ke perangkat.

## Fitur-Fitur Utama

Aplikasi ini memenuhi kriteria wajib dari _submission_ dan mencakup fitur-fitur berikut:

### Kriteria Wajib Submission 1 (Dipertahankan)

- **Pemanfaatan API sebagai Sumber Data:** Mengambil dan mengirim data cerita dari [Story API Dicoding](https://story-api.dicoding.dev/v1/).
- **Arsitektur Single-Page Application (SPA):** Menggunakan _routing_ berbasis _hash_ (`#/`) dan menerapkan pola Model-View-Presenter (MVP).
- **Menampilkan Data:** Menampilkan daftar cerita dari API, dengan minimal satu gambar dan tiga data teks per item. Setiap cerita dengan lokasi dilengkapi dengan peta digital interaktif (Leaflet.js) yang menampilkan _marker_ dan _popup_.
- **Fitur Tambah Data Baru:** Memungkinkan pengguna menambahkan cerita baru dengan deskripsi, mengambil foto langsung dari kamera perangkat, dan memilih lokasi (latitude & longitude) melalui interaksi klik pada peta.
- **Aksesibilitas Sesuai Standar (WCAG):**
  - Menerapkan "Skip to Content" untuk navigasi keyboard.
  - Menggunakan `alt text` pada gambar esensial.
  - Memastikan `form control` berasosiasi dengan `<label>`.
  - Menggunakan elemen semantik HTML (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`).
- **Transisi Halaman Halus:** Mengimplementasikan `View Transition API` untuk pengalaman navigasi yang mulus antar halaman.

### Kriteria Wajib Submission 2 (Fitur Baru)

- **Menerapkan Push Notification:** Mengimplementasikan _push notification_ untuk pemberitahuan cerita baru, menggunakan VAPID keys dari Story API.
- **Mengadopsi PWA (Installable & Offline):**
  - Menerapkan Arsitektur Application Shell: Konten statis (UI dasar) di-_cache_ untuk pemuatan instan.
  - Aplikasi dapat dipasang ke Homescreen (`Add to Homescreen`) layaknya aplikasi _native_ melalui `Web App Manifest`.
  - Aplikasi dapat diakses dalam keadaan _offline_ tanpa UI yang gagal ditampilkan, termasuk daftar cerita dari API (menggunakan _caching_ Service Worker).
- **Memanfaatkan IndexedDB:**
  - Aplikasi menyediakan fitur "Favorit" untuk menyimpan cerita secara lokal di IndexedDB.
  - Pengguna dapat **menyimpan** cerita dari daftar, **menampilkan** daftar cerita favorit di halaman terpisah, dan **menghapus** cerita dari favorit. Data ini tersedia saat _offline_.
- **Distribusi secara Publik:** Aplikasi di-_deploy_ ke Netlify dan dapat diakses secara publik. URL deployment dilampirkan dalam `STUDENT.txt`.

## Kriteria Opsional (Diterapkan)

- **Memiliki Shortcuts dan Screenshots untuk Desktop dan Mobile:** Menyediakan _shortcuts_ di `manifest.json` (contoh: "Tambah Cerita Baru") dan _screenshot_ untuk tampilan desktop dan mobile.
- **Menggunakan Workbox untuk Offline Capability:** Memanfaatkan pustaka Workbox untuk menyederhanakan logika _caching_ dan manajemen Service Worker, memastikan _offline capability_ yang robust.
- **Menyediakan Halaman Not Found:** Menampilkan halaman khusus jika pengguna mengakses rute yang tidak dikenali oleh aplikasi.

## Cara Menginstal dan Menggunakan Aplikasi

1.  **Kloning Repository:**
    ```bash
    git clone https://github.com/ucupdev23/dicoding-story-app-pwa-final.git
    cd dicoding-story-app-pwa-final
    ```
2.  **Instal Dependensi:**
    ```bash
    npm install
    ```
3.  **Jalankan Aplikasi dalam Mode Pengembangan:**
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:5173/` (atau port lain).
4.  **Menginstal PWA:** Di browser Chrome/Edge, klik ikon "Install App" di bilah alamat, atau temukan opsi instalasi di menu browser.
5.  **Penggunaan Aplikasi:**
    - **Registrasi & Login:** Daftar akun baru atau login dengan akun yang sudah ada.
    - **Lihat Cerita:** Setelah login, Anda akan diarahkan ke halaman daftar cerita.
    - **Tambah Cerita:** Navigasi ke halaman "Tambah Cerita", gunakan kamera dan peta untuk menambahkan cerita baru.
    - **Favorit:** Klik tombol hati di setiap cerita untuk menambahkan/menghapus dari favorit. Lihat daftar cerita favorit di halaman "Favorit".
    - **Uji Offline:** Matikan koneksi internet atau simulasikan offline di DevTools, lalu refresh aplikasi. UI dasar, data cerita, dan cerita favorit seharusnya masih bisa diakses.
    - **Uji Push Notification:** Berikan izin notifikasi. Dari DevTools (Application > Service Workers), kirim pesan push.

## Deployment

Aplikasi ini di-deploy secara publik di Netlify.

**URL Aplikasi:** [https://gorgeous-ganache-520de5.netlify.app/](https://gorgeous-ganache-520de5.netlify.app/) ## Kredit

## Kelas ini dibimbing oleh Dicoding Indonesia.
