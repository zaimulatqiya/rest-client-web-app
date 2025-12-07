# Cara Memperbaiki Backend PHP untuk Support PUT Request

## Masalah

Backend PHP mengembalikan error "Method tidak didukung" saat menerima PUT request.

## Solusi 1: Tambahkan Handler PUT di transaksi.php

Tambahkan kode berikut di **bagian paling atas** file `transaksi.php` Anda (sebelum kode PHP lainnya):

```php
<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override");
header("Content-Type: application/json");

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Deteksi method (support method override)
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
}

// Handle PUT request
if ($method === 'PUT') {
    // Baca data dari request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit();
    }

    // Ambil ID dari query parameter atau dari body
    $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($data['id']) ? intval($data['id']) : null);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID tidak ditemukan']);
        exit();
    }

    // Validasi data
    if (!isset($data['tanggal']) || !isset($data['nama_pelanggan']) || !isset($data['items'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Data tidak lengkap']);
        exit();
    }

    // ============================================
    // KODE UPDATE DATABASE ANDA DI SINI
    // ============================================
    // Contoh:
    /*
    require_once 'config.php'; // Koneksi database Anda

    $tanggal = $data['tanggal'];
    $nama_pelanggan = $data['nama_pelanggan'];

    // Update transaksi
    $stmt = $conn->prepare("UPDATE transaksi SET tanggal = ?, nama_pelanggan = ? WHERE id = ?");
    $stmt->bind_param("ssi", $tanggal, $nama_pelanggan, $id);
    $stmt->execute();

    // Hapus items lama
    $stmt = $conn->prepare("DELETE FROM transaksi_items WHERE transaksi_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    // Insert items baru
    foreach ($data['items'] as $item) {
        $produk_id = intval($item['produk_id']);
        $qty = intval($item['qty']);
        $harga_satuan = floatval($item['harga_satuan']);

        $stmt = $conn->prepare("INSERT INTO transaksi_items (transaksi_id, produk_id, qty, harga_satuan) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiid", $id, $produk_id, $qty, $harga_satuan);
        $stmt->execute();
    }
    */

    // Response sukses
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Transaksi berhasil diupdate',
        'id' => $id
    ]);
    exit();
}

// Jika method tidak didukung, lanjutkan ke handler lain (GET, POST, dll)
// Jangan exit() di sini, biarkan kode PHP Anda yang sudah ada menangani method lain
?>
```

## Solusi 2: Jika Server Tidak Support PUT

Jika server PHP Anda benar-benar tidak bisa handle PUT (misalnya shared hosting), gunakan POST dengan parameter `_method=PUT`:

Di frontend, ubah PUT menjadi POST dengan query parameter `_method=PUT`.

## Checklist

Pastikan:

- ✅ CORS headers sudah ditambahkan
- ✅ `$_SERVER['REQUEST_METHOD'] === 'PUT'` dicek dengan benar
- ✅ Data dibaca dari `php://input` (bukan `$_POST`)
- ✅ JSON di-decode dengan benar
- ✅ ID diambil dari query parameter atau body
- ✅ Response dikembalikan dalam format JSON

## Test

Setelah menambahkan kode di atas, test dengan:

1. Buka REST Client
2. Pilih method PUT
3. Isi URL: `http://localhost/DBREST/api/transaksi.php?id=6`
4. Isi form transaksi
5. Klik "Kirim"
6. Seharusnya tidak lagi error "Method tidak didukung"
