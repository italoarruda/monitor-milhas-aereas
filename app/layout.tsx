import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Monitor Milhas Aéreas',
  description: 'Monitore o valor de passagens em milhas — GOL Smiles, LATAM Pass e Azul Infinito',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="flex h-full overflow-hidden bg-[var(--background)]">
        <ThemeProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
