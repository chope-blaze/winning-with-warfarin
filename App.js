import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import FoodScreen from './screens/FoodScreen';
import INRScreen from './screens/INRScreen'; // this is now the tab screen
import INRChartScreen from './screens/INRChartScreen'; // chart is a sub-screen
import MoreScreen from './screens/MoreScreen';
import OpenAITestScreen from './screens/OpenAITestScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom Tab Navigator
function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="INR" component={INRScreen} />
      <Tab.Screen name="Food" component={FoodScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

// App container with Stack for nested navigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Chart" component={INRChartScreen} />
        <Stack.Screen name="OpenAITest" component={OpenAITestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
