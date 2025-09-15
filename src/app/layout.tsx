import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "myCard Services - Tarjetas NFC Inteligentes para tu Negocio",
  description: "Conecta sin esfuerzo con tus clientes. Nuestras tarjetas NFC proporcionan acceso instantáneo a tus servicios, precios y agendamiento de citas con un solo toque.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      </head>
      <body className={`${poppins.variable} font-poppins antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
