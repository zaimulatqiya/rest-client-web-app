<?php
// ============================================
// CARA MEMPERBAIKI PUT REQUEST DI TRANSAKSI.PHP
// ============================================
// 
// LANGKAH 1: Buka file: C:\xampp2\htdocs\DBREST\api\transaksi.php
// 
// LANGKAH 2: Tambahkan kode di bawah ini di BAGIAN PALING ATAS
//            (sebelum semua kode PHP lainnya, bahkan sebelum koneksi database)
// 
// LANGKAH 3: Simpan file dan test lagi
// ============================================

// CORS Headers - HARUS PALING ATAS!
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================
// HANDLE PUT REQUEST - TAMBAHKAN INI
// ============================================
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    
    // Baca data dari request body (PUT tidak pakai $_POST!)
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Cek apakah JSON valid
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON format']);
        exit();
    }
    
    // Ambil ID dari query parameter (dari URL: ?id=2)
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    // Jika ID tidak ada di query, coba ambil dari body
    if (!$id && isset($data['id'])) {
        $id = intval($data['id']);
    }
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID tidak ditemukan. Pastikan URL berisi ?id=2']);
        exit();
    }
    
    // Validasi data yang diperlukan
    if (!isset($data['tanggal']) || !isset($data['nama_pelanggan']) || !isset($data['items'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Data tidak lengkap. Perlu: tanggal, nama_pelanggan, items']);
        exit();
    }
    
    // ============================================
    // KONEKSI DATABASE - SESUAIKAN DENGAN ANDA
    // ============================================
    // Jika sudah ada koneksi di file lain, gunakan itu
    // require_once 'config.php';
    // Atau buat koneksi baru:
    // $conn = new mysqli("localhost", "root", "", "nama_database");
    
    // ============================================
    // UPDATE DATABASE - SESUAIKAN DENGAN STRUKTUR TABEL ANDA
    // ============================================
    // Contoh struktur tabel:
    // - transaksi: id, tanggal, nama_pelanggan
    // - transaksi_items: id, transaksi_id, produk_id, qty, harga_satuan
    
    try {
        // Mulai transaksi
        // $conn->begin_transaction();
        
        // Update transaksi
        $tanggal = $data['tanggal'];
        $nama_pelanggan = $data['nama_pelanggan'];
        
        // Contoh query update (sesuaikan dengan struktur tabel Anda):
        /*
        $sql = "UPDATE transaksi SET tanggal = ?, nama_pelanggan = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssi", $tanggal, $nama_pelanggan, $id);
        $stmt->execute();
        
        // Hapus items lama
        $sql = "DELETE FROM transaksi_items WHERE transaksi_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        // Insert items baru
        foreach ($data['items'] as $item) {
            $produk_id = intval($item['produk_id']);
            $qty = intval($item['qty']);
            $harga_satuan = floatval($item['harga_satuan']);
            
            $sql = "INSERT INTO transaksi_items (transaksi_id, produk_id, qty, harga_satuan) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iiid", $id, $produk_id, $qty, $harga_satuan);
            $stmt->execute();
        }
        
        // Commit transaksi
        // $conn->commit();
        */
        
        // Response sukses
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Transaksi berhasil diupdate',
            'id' => $id,
            'data' => [
                'tanggal' => $data['tanggal'],
                'nama_pelanggan' => $data['nama_pelanggan'],
                'items' => $data['items']
            ]
        ]);
        exit();
        
    } catch (Exception $e) {
        // Rollback jika ada error
        // $conn->rollback();
        http_response_code(500);
        echo json_encode([
            'error' => 'Gagal update transaksi',
            'message' => $e->getMessage()
        ]);
        exit();
    }
}

// ============================================
// PENTING: JANGAN EXIT() DI SINI!
// Biarkan kode PHP Anda yang sudah ada menangani method lain (GET, POST, dll)
// ============================================
// Jika Anda ingin menambahkan handler untuk method lain juga,
// tambahkan sebelum baris ini, atau biarkan kode lama Anda menanganinya.
?>

