"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, logEvent as firebaseLogEvent, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is configured
export const isFirebaseConfigured = firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your-api-key" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your-project-id";

// Initialize Firebase (client-side) only if configured
let app: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export { auth, googleProvider };

// Analytics instance
let analytics: Analytics | null = null;

// Initialize analytics only in browser and if Firebase is configured
export const getAnalyticsInstance = () => {
  if (typeof window !== "undefined" && !analytics && isFirebaseConfigured && app) {
    analytics = getAnalytics(app);
  }
  return analytics;
};

// Analytics event tracking helpers
export const logAnalyticsEvent = (eventName: string, params?: Record<string, any>) => {
  const analyticsInstance = getAnalyticsInstance();
  if (analyticsInstance) {
    firebaseLogEvent(analyticsInstance, eventName, params);
  }
};

// Predefined analytics events
export const trackMoodSelected = (mood: string) => {
  logAnalyticsEvent("mood_selected", { mood });
};

export const trackMovieViewed = (movieId: number, movieTitle: string) => {
  logAnalyticsEvent("movie_viewed", { movie_id: movieId, movie_title: movieTitle });
};

export const trackMovieAddedToWatchlist = (movieId: number, movieTitle: string) => {
  logAnalyticsEvent("movie_added_to_watchlist", { movie_id: movieId, movie_title: movieTitle });
};

export const trackMovieMarkedWatched = (movieId: number, movieTitle: string) => {
  logAnalyticsEvent("movie_marked_watched", { movie_id: movieId, movie_title: movieTitle });
};

export const trackDiaryEntryCreated = (movieId: number, rating?: number) => {
  logAnalyticsEvent("diary_entry_created", { movie_id: movieId, rating });
};

export const trackMovieAddedToFavorites = (movieId: number, movieTitle: string) => {
  logAnalyticsEvent("movie_added_to_favorites", { movie_id: movieId, movie_title: movieTitle });
};

export const trackListCreated = (listName: string) => {
  logAnalyticsEvent("list_created", { list_name: listName });
};
