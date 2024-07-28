"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/themeContext";
import ClientThemeWrapper from "@/context/ClientThemeWrapper";

const inter = Inter({ subsets: ["latin"] });

const MainLayout = ({ children }) => (
  <html lang="fr" data-theme="lemonade">
    <body className={inter.className}>{children}</body>
  </html>
);

const LoginLayout = ({ children }) => (
  <ThemeProvider>
    <ClientThemeWrapper>
      {children}
    </ClientThemeWrapper>
  </ThemeProvider>
);


const HomeLayout = ({ children }) => (
      <ThemeProvider>
        <ClientThemeWrapper>
          <Navbar />
          {children}
          <Footer />
        </ClientThemeWrapper>
      </ThemeProvider>
);


const AlternativeLayout = ({ children }) => (
  <html lang="fr">
    <body className={inter.className}>
      <ThemeProvider>
        <ClientThemeWrapper>
          {children}
        </ClientThemeWrapper>
      </ThemeProvider>
    </body>
  </html>
);

const Layout = ({ layoutType, children }) => {
  let LayoutComponent = MainLayout; // Default layout

  if (layoutType === "home") {
    LayoutComponent = HomeLayout;
  } else if (layoutType === "alternative") {
    LayoutComponent = AlternativeLayout;
  } else if (layoutType === "login") {
    LayoutComponent = LoginLayout;
  } else {
    LayoutComponent = MainLayout;
  }

  return <LayoutComponent>{children}</LayoutComponent>;
};

export default Layout;
