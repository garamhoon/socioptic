import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>{children}</body>
      </AuthProvider>
    </html>
  );
}
