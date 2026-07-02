import './globals.css';
import AppProviders from '@/lib/AppProviders';

export const metadata = {
  title: 'Knights Kingdom',
  description: 'Knights Kingdom remake',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}