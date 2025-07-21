import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App); // ✅ This makes App the root of the native app
