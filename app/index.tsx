import 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getAccount } from '../lib/appwrite'; // ✅ Ensure this exists

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 100); // Wait briefly for layout to mount
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const init = async () => {
      const user = await getAccount();
      if (user) {
        router.replace('/citizen/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    };
    if (isReady) {
      init();
    }
  }, [isReady]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
}
