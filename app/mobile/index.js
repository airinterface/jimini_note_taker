/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { database } from '@/data/database'
import App from './App';
import { name as appName } from './app.json';
AppRegistry.registerComponent(appName, () => App);
