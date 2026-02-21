import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Talkerys — English Conversation Club",
  description: "Club de conversación en inglés en Miraflores, Lima. Reuniones semanales en las mejores cafeterías. Practica inglés con nativos y estudiantes avanzados.",
  openGraph: {
    title: "Talkerys — English Conversation Club",
    description: "Club de conversación en inglés en Miraflores, Lima.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Talkerys",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
