'use client'
import Firebase, { FirebaseContext } from '../Firebase';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseContext.Provider value={new Firebase()}>
      <html lang="en" suppressHydrationWarning>
        <body>
          {children}
        </body>
      </html>
    </FirebaseContext.Provider>
  );
}
