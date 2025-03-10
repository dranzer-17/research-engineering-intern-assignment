// app/layout.jsx
import './globals.css'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Reddit Clone - SimPPL',
  description: 'A Reddit-like UI for displaying SimPPL dataset',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}
      </body>
    </html>
    
  )
}