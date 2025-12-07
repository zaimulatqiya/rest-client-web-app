<?php
// Contoh kode PHP untuk handle PUT request pada transaksi.php
// Tambahkan di bagian paling atas file transaksi.php Anda

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Deteksi method (support method override untuk browser yang tidak support PUT)
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
}

// Handle PUT request (atau POST dengan method override)
if ($method === 'PUT' || ($method === 'POST' && isset($_GET['_method']) && $_GET['_method'] === 'PUT')) {
    // Baca data dari request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Ambil ID dari query parameter atau dari body
    $id = isset($_GET['id']) ? $_GET['id'] : (isset($data['id']) ? $data['id'] : null);
    
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
    
    // Lakukan update ke database
    // Contoh dengan mysqli:
    /*
    $conn = new mysqli("localhost", "username", "password", "database");
    
    $tanggal = $conn->real_escape_string($data['tanggal']);
    $nama_pelanggan = $conn->real_escape_string($data['nama_pelanggan']);
    
    // Update transaksi
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
        $produk_id = $item['produk_id'];
        $qty = $item['qty'];
        $harga_satuan = $item['harga_satuan'];
        
        $sql = "INSERT INTO transaksi_items (transaksi_id, produk_id, qty, harga_satuan) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iiid", $id, $produk_id, $qty, $harga_satuan);
        $stmt->execute();
    }
    
    $conn->close();
    */
    
    // Response sukses
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Transaksi berhasil diupdate',
        'id' => $id,
        'data' => $data
    ]);
    exit();
}

// Jika method tidak didukung
http_response_code(405);
echo json_encode(['error' => 'Method tidak didukung']);
?>

