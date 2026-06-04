<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$font_name = preg_replace('/[^a-zA-Z0-9_\-]/', '', $_POST['font_name'] ?? '');
if (empty($font_name)) {
    http_response_code(400);
    echo json_encode(['error' => 'font_name is required']);
    exit;
}

$meta_file  = __DIR__ . '/fonts/fonts.json';
$upload_dir = __DIR__ . '/fonts/uploads/';

// 從 fonts.json 移除
$fonts = [];
if (file_exists($meta_file)) {
    $fonts = json_decode(file_get_contents($meta_file), true) ?: [];
}
$fonts = array_values(array_filter($fonts, fn($f) => $f['name'] !== $font_name));
file_put_contents($meta_file, json_encode($fonts));

// 刪除實際檔案
foreach (['pfb', 'ttf'] as $ext) {
    $path = $upload_dir . $font_name . '.' . $ext;
    if (file_exists($path)) unlink($path);
}

echo json_encode(['success' => true]);
