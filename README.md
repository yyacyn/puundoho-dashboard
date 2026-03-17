# Panduan Pengembangan Dashboard Desa Puundoho

Dokumen ini berisi informasi singkat tentang teknologi, struktur, dan panduan untuk melanjutkan pengembangan front-end dashboard Desa Puundoho.

## Tech Stack

- **Framework**: [React.js](https://react.dev/) dengan build tool [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (menggunakan utility classes untuk styling yang cepat dan responsif)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (khususnya menggunakan set **Remix Icon** `Ri...`)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/) (untuk interaktif map pada fitur Listing Fasilitas)
- **Rich Text Editor**: [React Quill](https://github.com/zenoamaro/react-quill) (untuk WYSIWYG editor pada pembuatan Berita/Artikel)
- **Image Hosting**: [ImageKit.io](https://imagekit.io/) (diintegrasikan secara client-side dengan signature dari server agar aman)

## Struktur Direktori Utama

```text
dashboard/
├── src/
│   ├── api.js                   # Setup routing ke API Backend & ImageKit signature fetcher
│   ├── App.jsx                  # Root komponen, routing utama, & manajemen state 'role'
│   ├── index.css                # Global CSS (Tailwind imports, custom map & editor dark mode)
│   ├── main.jsx                 # Entry point aplikasi
│   └── components/              # Direktori komponen utama
│       ├── DashboardLayout.jsx  # Layout utama berisi Sidebar dan Outlet halaman
│       ├── Sidebar.jsx          # Komponen navigasi kiri (handling hak akses admin vs bendahara)
│       ├── Login.jsx            # Form otentikasi
│       ├── Overview.jsx         # Halaman dashboard depan
│       ├── Articles.jsx         # CRUD fitur Berita/Artikel
│       ├── Gallery.jsx          # CRUD fitur Galeri Foto
│       ├── Listing.jsx          # CRUD fitur Fasilitas & interaksi Map
│       ├── PendudukList.jsx     # Manajemen Dataset kependudukan tahunan
│       └── PendudukEditor.jsx   # Spreadsheet-like editor untuk data penduduk
```

## Konvensi Desain (UI/UX)

1. **Dark Theme First**: Aplikasi ini utamanya bergaya modern dark mode (Glassmorphism ringan).
   - Background utama: `#0A0A0B`
   - Background komponen/card: `#141417` / `#1A1A1D`
   - Border lines: `#2A2A2E` atau `#1F1F23`
   - Aksen utama (Hijau): `#298064`
2. **Icons**: Selalu gunakan Remix Icons (`Ri`) untuk menjaga konsistensi visual.
3. **Modals**: Menggunakan layout layar penuh dengan background hitam transparan (`bg-black/60 backdrop-blur-sm`). Untuk modal kompleks (seperti Artikel & Listing), form dibagi dua kolom (Proporsi 35% Kiri : 65% Kanan).
4. **Roles**: Selalu ingat bahwa komponen `Sidebar` dan API handling dibatasi dengan role (`admin` vs `bendahara`).

## Menjalankan Secara Lokal

1. Pastikan Anda berada di direktori `dashboard`
2. Instal depedensi: `npm install`
3. Jalankan server dev: `npm run dev`
4. Pastikan backend server berbahasa Go sedang berjalan di background agar login dan fetching API bisa dilakukan.

## Menambahkan Halaman Baru

1. Buat komponen halamannya di dalam folder `src/components/`, misalnya `DataStunting.jsx`.
2. Buka `src/components/DashboardLayout.jsx` dan tambahkan `<Route path="stunting" element={<DataStunting />} />`
3. Halaman otomatis muncul ketika di-klik melalui Sidebar, sesuai otorisasi rule yang sudah ter-setup di sana.
