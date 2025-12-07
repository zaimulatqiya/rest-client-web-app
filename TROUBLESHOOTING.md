# Troubleshooting Network Error

## Masalah: Network Error saat mengakses API localhost

Jika Anda mendapatkan error "Network Error" saat mencoba mengakses API PHP di localhost, berikut adalah solusinya:

### Solusi 1: Tambahkan CORS Headers di PHP (DISARANKAN)

Tambahkan kode berikut di **bagian paling atas** file PHP Anda (`transaksi.php`), sebelum kode PHP lainnya:

```php
<?php
// Tambahkan di bagian paling atas file
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ... kode PHP Anda yang sudah ada di bawah sini
?>
```

### Solusi 2: Pastikan Server PHP Berjalan

1. Buka XAMPP/WAMP Control Panel
2. Pastikan **Apache** statusnya **Running** (hijau)
3. Test di browser: buka `http://localhost/DBREST/api/transaksi.php`
4. Jika muncul error/halaman, berarti server sudah berjalan

### Solusi 3: Cek URL

Pastikan URL yang Anda gunakan benar:
- ✅ `http://localhost/DBREST/api/transaksi.php`
- ✅ `http://127.0.0.1/DBREST/api/transaksi.php`
- ❌ `localhost/DBREST/api/transaksi.php` (tanpa http://)

### Solusi 4: Restart Dev Server

Setelah perubahan di `vite.config.ts`, restart dev server:

1. Hentikan server (Ctrl+C di terminal)
2. Jalankan lagi: `npm run dev`
3. Refresh browser

### Solusi 5: Gunakan Browser Extension (Sementara)

Sebagai workaround sementara, Anda bisa install browser extension seperti:
- **CORS Unblock** (Chrome/Edge)
- **CORS Everywhere** (Firefox)

**⚠️ PERINGATAN:** Hanya gunakan untuk development, jangan di production!

---

## Contoh File PHP dengan CORS

Lihat file `CORS_HEADER_EXAMPLE.php` untuk contoh lengkap.

## Masih Error?

Jika setelah mencoba semua solusi di atas masih error, periksa:

1. **Console Browser** (F12) - lihat error detail
2. **Network Tab** - lihat request yang dikirim
3. **Server Logs** - cek log error Apache/PHP
4. **Firewall** - pastikan tidak memblokir port 80/5173

