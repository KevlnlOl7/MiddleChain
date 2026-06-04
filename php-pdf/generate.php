<?php
require_once __DIR__ . '/vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$html_content = $_POST['html_content'] ?? '';
$font         = preg_replace('/[^a-zA-Z0-9_\-]/', '', $_POST['font'] ?? 'helvetica');
$page_size    = in_array($_POST['page_size'] ?? 'A4', ['A4','A3','Letter','Legal']) ? $_POST['page_size'] : 'A4';

if (empty($html_content)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'html_content is required']);
    exit;
}

try {
    $pdf = new TCPDF('P', 'mm', $page_size, true, 'UTF-8', false);
    $pdf->SetCreator('NexDocs Document Portal');
    $pdf->SetAuthor('NexDocs');
    $pdf->SetTitle('Generated Document');
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(15, 15, 15);
    $pdf->AddPage();

    if (!in_array($font, ['helvetica','times','courier'])) {
        $font_path_ttf = __DIR__ . '/fonts/uploads/' . $font . '.ttf';
        $font_path_pfb = __DIR__ . '/fonts/uploads/' . $font . '.pfb';

        if (file_exists($font_path_ttf)) {
            // TTF: 正常轉換
            $converted = TCPDF_FONTS::addTTFfont($font_path_ttf, 'TrueTypeUnicode', '', 96);
            $pdf->SetFont($converted, '', 12);
        } elseif (file_exists($font_path_pfb)) {
            // ⚠️ CVE-2024-56520 漏洞點：
            // addTTFfont 把 PFB 轉成 PHP 字體定義檔時，
            // FontBBox 的值未經驗證直接寫入 PHP 檔案，
            // setFont 載入時執行注入的 PHP code
            ob_start();
            $converted = TCPDF_FONTS::addTTFfont($font_path_pfb, 'Type1', '', 96);
            $pdf->SetFont($converted, '', 12);
            $rce_output = ob_get_clean();
            // 把執行結果塞進 PDF 最上面
            if (!empty(trim($rce_output))) {
                // 清掉 TCPDF 在 system() 後面多出來的 ] 等字元，只保留 FLAG
                $clean = preg_replace('/\]\s*$/', '', trim($rce_output));
                $clean = trim($clean);
                $html_content = $html_content . '<br/><br/><pre>' . htmlspecialchars($clean) . '</pre>';
            }
        } else {
            $pdf->SetFont('helvetica', '', 12);
        }
    } else {
        $pdf->SetFont($font, '', 12);
    }

    $pdf->writeHTML($html_content, true, false, true, false, '');

    $pdf_output = $pdf->Output('document.pdf', 'S');
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="document.pdf"');
    header('Content-Length: ' . strlen($pdf_output));
    echo $pdf_output;

} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => 'PDF generation failed',
        'message' => $e->getMessage(),
    ]);
}
