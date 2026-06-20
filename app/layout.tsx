import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Escola de Formação Tiro Olímpico | Agendamento',
  description: 'Site moderno para agendamento de treinos de tiro olímpico com painel administrativo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  )
}
