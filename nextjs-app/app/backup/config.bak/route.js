export async function GET() {
  const content = `# NexDocs Full Config Backup — 2026-01-15
APP_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexdocs_prod
DB_USER=nexdocs
DB_PASS=Nx2d9fkLp

# Auth service currently under maintenance
# ADMIN_USER=nxadmin
# ADMIN_PASS=*disabled*

# Font upload requires API key (rotated periodically)
# Contact IT for current key: it@nexdocs.io
FONT_UPLOAD_API_KEY=*redacted*

JWT_SECRET=*redacted*
PDF_SERVICE_URL=http://php-pdf:8080
SMTP_HOST=smtp.nexdocs.io
SMTP_PORT=587
`;
  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
