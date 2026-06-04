<?php
/**
 * Font Upload Endpoint
 * ⚠️  CVE-2024-56520 漏洞點：未對 .pfb 字體的 FontBBox 做任何驗證
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$upload_dir = __DIR__ . '/fonts/uploads/';
$meta_file  = __DIR__ . '/fonts/fonts.json';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$label = trim($_POST['label'] ?? '');
if (empty($label)) {
    http_response_code(400);
    echo json_encode(['error' => 'Font label is required']);
    exit;
}

if (!isset($_FILES['font']) || $_FILES['font']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid file uploaded']);
    exit;
}

$original_name = $_FILES['font']['name'];
$ext = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));

if (!in_array($ext, ['ttf', 'pfb'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Only .ttf and .pfb files are allowed']);
    exit;
}

// 驗證 magic bytes
$tmp_path = $_FILES['font']['tmp_name'];
$fh = fopen($tmp_path, 'rb');
$magic = fread($fh, 4);
fclose($fh);

$valid = false;
if ($ext === 'ttf') {
    $valid = (substr($magic, 0, 4) === "\x00\x01\x00\x00" || substr($magic, 0, 4) === "true");
} elseif ($ext === 'pfb') {
    $valid = (substr($magic, 0, 2) === "\x80\x01");
}

if (!$valid) {
    http_response_code(400);
    echo json_encode(['error' => 'File content does not match the declared format']);
    exit;
}

// 產生唯一的字體 name
$font_name = 'font_' . substr(md5($label . time()), 0, 8);
$dest = $upload_dir . $font_name . '.' . $ext;

if (!move_uploaded_file($_FILES['font']['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save font file']);
    exit;
}

// 更新 fonts.json
$fonts = [];
if (file_exists($meta_file)) {
    $fonts = json_decode(file_get_contents($meta_file), true) ?: [];
}

$fonts[] = [
    'name'  => $font_name,
    'label' => $label,
    'file'  => $font_name . '.' . $ext,
    'hash'  => hash_file('sha256', $dest),
    'added' => date('Y-m-d'),
];

file_put_contents($meta_file, json_encode($fonts));

echo json_encode(['success' => true, 'font_name' => $font_name]);
