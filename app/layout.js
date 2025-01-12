import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/header";
export const metadata = {
  title: "Schedullr",
  description: "One stop solution to schedule your appointments/bookings",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/*Header */}
      <body className={inter.className}>
        {children}
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white"></main>
        <footer className="bg-blue-100 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Made by Akshay</p>
          </div>
        </footer>

        {/*Footer */}
      </body>
    </html>
  );
}
