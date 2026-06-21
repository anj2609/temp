import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "EMI Calculator",
  description:
    "A loan EMI calculator whose state syncs in real time across every open browser tab.",
};

const melody = localFont({
  src: [
    { path: "../fonts/BETA/BLMelody-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "../fonts/BETA/BLMelody-Light.woff2",      weight: "300", style: "normal" },
    { path: "../fonts/BETA/BLMelody-Regular.woff2",    weight: "400", style: "normal" },
    { path: "../fonts/BETA/BLMelody-Medium.woff2",     weight: "500", style: "normal" },
    { path: "../fonts/BETA/BLMelody-SemiBold.woff2",   weight: "600", style: "normal" },
    { path: "../fonts/BETA/BLMelody-Bold.woff2",       weight: "700", style: "normal" },
  ],
  variable: "--font-melody",
  display: "swap",
});

const themeScript = `(function(){try{var raw=localStorage.getItem('emi-workspace-v1');var t=raw?JSON.parse(raw).theme:null;if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${melody.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
