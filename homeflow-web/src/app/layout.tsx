import '@/styles/globals.css';
import { cn } from '@/lib/utils';
import { notoSansThai } from '@/styles/font';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Homeflow',
    default: 'Homeflow'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn(
        'antialiased',
        'font-sans',
        notoSansThai.variable
      )}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background">{children}</body>
    </html>
  );
}
