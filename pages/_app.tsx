// _app.tsx
import React from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import CurrentUserProvider from "@/context/CurrentUserContext";
import { ThemeProvider } from "next-themes";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <CurrentUserProvider>
        <div 
          style={{ minHeight: '100vh', fontFamily: "Helvetica" }}
          className='bg-gray-50 dark:bg-black transition-colors'
        >
          <Component {...pageProps} />
        </div>
      </CurrentUserProvider>
    </ThemeProvider>
  );
}
export default App;