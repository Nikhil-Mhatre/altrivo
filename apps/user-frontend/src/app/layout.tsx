import "./global.css";
import { Playfair_Display, Fira_Code, Lora } from "next/font/google";
import { Providers } from "./utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata = {
  title: "Welcome to Altrivo",
  description: "Shop smarter with Altrivo, your trusted e-commerce platform.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${firaCode.variable} ${lora.variable}`}
    >
      <body className="font-serif">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
