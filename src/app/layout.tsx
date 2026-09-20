import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Digital Heroes — Performance, Charity & Monthly Draws',
  description: 'Turn your golf rounds into radical social good while participating in monthly prize draws.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
