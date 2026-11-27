import type { Metadata } from 'next';
import { Barlow_Condensed, JetBrains_Mono, Roboto } from 'next/font/google';
import AppShell from '../components/layout/AppShell';
import './globals.css';

const barlowCondensed = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-barlow-condensed' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: '4.º Campeonato Perritos Locos',
  description: 'Gestión del torneo: equipos, partidos, clasificación, rankings y jugadores.',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem('pdl.theme');
    if (theme === 'light') document.documentElement.dataset.theme = 'light';
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${barlowCondensed.variable} ${roboto.variable} ${jetbrainsMono.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
