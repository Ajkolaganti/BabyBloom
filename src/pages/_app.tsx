import { useState, useEffect } from 'react';
import Head from 'next/head';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { createTheme } from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { notificationService } from '@/services/NotificationService';

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState(createTheme());

  useEffect(() => {
    const savedGender = localStorage.getItem('babyGender');
    if (savedGender) {
      setTheme(createTheme(savedGender));
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      const cleanup = notificationService.setupMessageListener((payload) => {
        // Handle foreground notifications
        if (Notification.permission === 'granted') {
          new Notification(payload.title, {
            body: payload.body,
            icon: '/icon-192x192.png',
          });
        }
      });

      // Cleanup function
      return () => {
        cleanup();
      };
    }
  }, []);

  const handleGenderChange = (gender: string) => {
    localStorage.setItem('babyGender', gender);
    setTheme(createTheme(gender));
  };

  return (
    <>
      <Head>
        <title>BabyDiary - Track Your Baby's Journey</title>
      </Head>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <AuthProvider>
          <Component {...pageProps} onGenderChange={handleGenderChange} />
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}
