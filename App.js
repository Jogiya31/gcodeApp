import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Registration from './screens/Registration';
import CodeGeneration from './screens/CodeGeneration';
import Index from './screens/Index';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={Index} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="CodeGeneration" component={CodeGeneration} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
