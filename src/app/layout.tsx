import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// A pixel font that is clean and readable
const pixelFont = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "多米习题站 Duomi Study",
  description: "Minecraft 风格的趣味练习生成器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pixelFont.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('duomi-theme');
                  if (theme) {
                    var themes = {
                      'classic': { bg: '#795548', card: '#E2E8F0', primary: '#4CAF50', secondary: '#FF9800', accent: '#2196F3', text: '#333' },
                      'ocean': { bg: '#0277BD', card: '#E3F2FD', primary: '#00BCD4', secondary: '#FF9800', accent: '#E91E63', text: '#333' },
                      'forest': { bg: '#2E7D32', card: '#E8F5E9', primary: '#FF9800', secondary: '#F44336', accent: '#7C4DFF', text: '#333' },
                      'sunset': { bg: '#BF360C', card: '#FBE9E7', primary: '#FFD600', secondary: '#00BCD4', accent: '#AA00FF', text: '#333' },
                      'night': { bg: '#1A1A2E', card: '#16213E', primary: '#E94560', secondary: '#0F3460', accent: '#533483', text: '#E0E0E0' }
                    };
                    var t = themes[theme];
                    if (t) {
                      document.documentElement.style.setProperty('--theme-bg', t.bg);
                      document.documentElement.style.setProperty('--theme-card', t.card);
                      document.documentElement.style.setProperty('--theme-primary', t.primary);
                      document.documentElement.style.setProperty('--theme-secondary', t.secondary);
                      document.documentElement.style.setProperty('--theme-accent', t.accent);
                      document.documentElement.style.setProperty('--theme-text', t.text);
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <ErrorBoundary>
          <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#795548" />
        {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
