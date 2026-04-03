import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  // 添加其它想暂时忽略的错误或警告信息
]);

export default function RootLayout() {
  return (
    <Provider>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false
        }}
      >
        <Stack.Screen name="index" options={{ title: "" }} />
        <Stack.Screen name="practice-difficulty" options={{ title: "" }} />
        <Stack.Screen name="practice" options={{ title: "" }} />
        <Stack.Screen name="practice-result" options={{ title: "" }} />
        <Stack.Screen name="competition-setup" options={{ title: "" }} />
        <Stack.Screen name="competition" options={{ title: "" }} />
        <Stack.Screen name="competition-result" options={{ title: "" }} />
      </Stack>
      <Toast />
    </Provider>
  );
}
