import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { LocalDataProvider } from "@/components/app/local-data-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SpendSmart — personal finance",
    template: "%s · SpendSmart",
  },
  description:
    "Track income, expenses, budgets, and savings in your secure personal account.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-navy-950">
        <LocalDataProvider>{children}</LocalDataProvider>
      </body>
    </html>
  );
}
