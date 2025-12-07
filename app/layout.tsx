import '../shared/styles/globals.css'; // only once
import Navbar from './modules/time-management/components/Navbar';

export default function RootLayout({children,}: {children: React.ReactNode;}) {
  return (
  <html lang="en">
    <body>
      <Navbar />
      <main>{children}</main>
    </body>
</html>
);
}