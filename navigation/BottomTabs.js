// navigation/BottomTabs.js
import React from 'react';
import { StyleSheet } from 'react-native';
import OpenAITestScreen from '../screens/OpenAITestScreen'; // adjust the path if needed

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import INRScreen from '../screens/INRScreen';
import FoodScreen from '../screens/FoodScreen';
import MoreScreen from '../screens/MoreScreen';
import INRChartScreen from '../screens/INRChartScreen';
import AnalysisHistoryScreen from '../screens/AnalysisHistoryScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: route.name,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            INR: 'medkit',
            Food: 'fast-food',
            More: 'ellipsis-horizontal',
            Chart: 'stats-chart',
            History: 'document-text',
          };
          return <Ionicons name={icons[route.name] || 'alert-circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chart" component={INRChartScreen} />
      <Tab.Screen name="INR" component={INRScreen} />
      <Tab.Screen name="Food" component={FoodScreen} />
      <Tab.Screen name="History" component={AnalysisHistoryScreen} />
<Tab.Screen name="More" component={OpenAITestScreen} />
    </Tab.Navigator>
  );
}
