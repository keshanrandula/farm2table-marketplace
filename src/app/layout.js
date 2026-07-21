import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Farm to Table",
  description: "Fresh farm produce straight to your table",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden max-w-full`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased transition-colors duration-200 overflow-x-hidden max-w-full">
        <ThemeInitializer />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
