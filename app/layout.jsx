import { Geist_Mono } from 'next/font/google'
import './globals.css'

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono'
})

export const metadata = {
  title: 'Kali Love CTF - San Valentin',
  description: 'Un CTF especial para el mejor del mundo mundial 💖',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistMono.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  )
}
