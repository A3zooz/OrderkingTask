import { Platform } from 'react-native';

// Prefer env var (Expo loads EXPO_PUBLIC_* at runtime), fallback to sensible defaults.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Platform.select({
    android: 'http://10.0.2.2:5000',
    ios: 'http://localhost:5000',
    web: 'http://localhost:5000',
    default: 'http://localhost:5000',
  });
