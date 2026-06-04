#!/bin/sh
# 建立 flag.txt
if [ -n "$FLAG2" ]; then
    printf '%s' "$FLAG2" > /flag.txt
else
    printf '%s' 'FLAG{2_tcpdf_code_injection_pwned_7f3a9c}' > /flag.txt
fi
# 建立字體上傳目錄並初始化 fonts.json
mkdir -p /app/fonts/uploads
chmod -R 777 /app/fonts
echo '[]' > /app/fonts/fonts.json
# TCPDF 字體目錄需要寫入權限
chmod -R 777 /app/vendor/tecnickcom/tcpdf/fonts
exec php -S 0.0.0.0:8080 -t /app \
  -d file_uploads=On \
  -d upload_max_filesize=50M \
  -d post_max_size=50M \
  -d upload_tmp_dir=/tmp
