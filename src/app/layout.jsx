'use client'
import './global.css'
import Firebase, { FirebaseContext } from '../Firebase';

export default function RootLayout({
  children,
}) {
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
