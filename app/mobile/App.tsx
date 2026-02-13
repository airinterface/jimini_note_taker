/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Navigation from './src/router';
import { database } from '@/data/database'
import { ServiceProvider } from '@/contexts/ServiceProvider';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ServiceProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Navigation />
      </SafeAreaProvider>
    </ServiceProvider>
  );
}

export default App;
