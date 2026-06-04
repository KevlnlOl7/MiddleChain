<?php
header('Content-Type: application/json');

$meta_file = __DIR__ . '/fonts/fonts.json';

if (!file_exists($meta_file)) {
    echo json_encode(['fonts' => []]);
    exit;
}

$fonts = json_decode(file_get_contents($meta_file), true) ?: [];
echo json_encode(['fonts' => $fonts]);
