import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Tech0 by scope3 - エネルギー管理',
  description: '企業向けエネルギー管理アプリ'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja" data-theme="light">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
