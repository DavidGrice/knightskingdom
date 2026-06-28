import './globals.css';
import { UserDataProvider } from '@/lib/context/UserDataProvider';

export const metadata = {
  title: 'Knights Kingdom',
  description: 'Knights Kingdom remake',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserDataProvider>{children}</UserDataProvider>
      </body>
    </html>
  );
}