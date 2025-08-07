import 'react-native-gesture-handler';
import { OPENAI_API_KEY } from '@env';


import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App); // ✅ This makes App the root of the native app
