import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Image Compressor",
  description: "Developed by Sanjiv Jaiswal, this is a simple Image Compressor tool to reduce image sizes!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/images/favicon-32x32.png" type="image/x-icon" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
