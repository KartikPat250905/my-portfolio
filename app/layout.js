import { Geist, Geist_Mono, Lato, Pacifico } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import ThemeToggle from "../components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kartik Patel - Portfolio",
  description: "Full-stack developer and technology enthusiast exploring, building, and learning. Showcasing projects in embedded systems, 3D web development, and systems programming.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className="" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add('no-transitions');requestAnimationFrame(function(){document.documentElement.classList.remove('no-transitions');});}catch(e){}})();` }} />
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
