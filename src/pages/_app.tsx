import { useState, useEffect } from 'react';
import Head from 'next/head';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { createTheme } from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { notificationService } from '@/services/NotificationService';
import { requestNotificationPermission, onMessageListener, firebaseConfig } from '@/firebase';

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState(createTheme());

  useEffect(() => {
    const savedGender = localStorage.getItem('babyGender');
    if (savedGender) {
      setTheme(createTheme(savedGender));
    }
  }, []);

  // PWA and Notification Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });

        // Pass Firebase config to service worker
        navigator.serviceWorker.ready.then((registration) => {
          if (registration.active) {
            registration.active.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfig
            });
          }
        });
      }

      // Setup notification permissions
      if ('Notification' in window) {
        requestNotificationPermission().then((token) => {
          if (token) {
            console.log('FCM Token:', token);
            localStorage.setItem('fcm_token', token);
          }
        });

        // Listen for foreground messages
        onMessageListener().then((payload: any) => {
          if (Notification.permission === 'granted') {
            new Notification(payload.notification?.title || 'BabyBloom', {
              body: payload.notification?.body || '',
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: 'baby-bloom-notification',
              renotify: true,
              vibrate: [200, 100, 200],
            });
          }
        }).catch((err) => console.log('Failed to receive message: ', err));

        const cleanup = notificationService.setupMessageListener((payload) => {
          // Handle custom notifications
          if (Notification.permission === 'granted') {
            new Notification(payload.title, {
              body: payload.body,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: 'baby-bloom-local',
              renotify: true,
              vibrate: [200, 100, 200],
            });
          }
        });

        return () => {
          cleanup();
        };
      }
    }
  }, []);

  const handleGenderChange = (gender: string) => {
    localStorage.setItem('babyGender', gender);
    setTheme(createTheme(gender));
  };

  return (
    <>
      <Head>
        <title>BabyBloom - Track Your Baby's Journey</title>
        <meta name="description" content="Track your baby's daily activities - feeding, sleep, and diaper changes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#e728ab" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BabyBloom" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
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
