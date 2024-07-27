import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

const MainLayout = ({ children }) => (
  <html lang="fr" data-theme="lemonade">
    <body className={inter.className}>{children}</body>
  </html>
);

const HomeLayout = ({ children }) => (
  <html lang="fr" data-theme="lemonade">
    <body className={inter.className}>
      <Navbar/>
      {children}
      <Footer/>
    </body>
  </html>
);

const PageLayout = ({ children }) => (
  <html lang="fr" data-theme="lemonade">
    <body className={inter.className}>
      <Navbar/>
      {children}
      <Footer/>
    </body>
  </html>
);


const AlternativeLayout = ({ children }) => (
  <html lang="fr" data-theme="lemonade">
    <body className={inter.className}>{children}</body>
  </html>
);

const Layout = ({ layoutType, children }) => {
  let LayoutComponent = MainLayout; // Layout par défaut

  if (layoutType === "home") {
    LayoutComponent = HomeLayout;
  } else if (layoutType === "alternative") {
    LayoutComponent = AlternativeLayout;
  }

  return <LayoutComponent>{children}</LayoutComponent>;
};

export default Layout;
