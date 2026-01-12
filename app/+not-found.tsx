import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Any unmatched route → go to app entry
    router.replace('/');
  }, [router]);

  return null;
}
