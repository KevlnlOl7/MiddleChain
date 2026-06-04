import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "NexDocs - Document Portal",
  description: "Professional PDF generation powered by NexDocs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111827" />
        <meta name="author" content="NexDocs Engineering" />
        <meta name="copyright" content="2026 NexDocs Inc." />
        <meta name="category" content="document-management" />
        <meta name="coverage" content="Worldwide" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
        <meta name="cache-ref" content="dXNlcjpueGFkbWluIC8gcGFzczpuZXhkMGNzX3Qzc3Q=" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
