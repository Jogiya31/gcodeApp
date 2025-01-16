import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Registration from "./screens/Registration";
import CodeGeneration from "./screens/CodeGeneration";
import Index from "./screens/Index";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen
          name="Index"
          component={Index}
          options={{
            gestureEnabled: false, // Disable swipe back gesture
            headerShown: false, // Optional: Hide the header
          }}
        />
        <Stack.Screen
          name="Registration"
          component={Registration}
          options={{
            gestureEnabled: false, // Disable swipe back gesture
            headerShown: false, // Optional: Hide the header
          }}
        />
        <Stack.Screen
          name="CodeGeneration"
          component={CodeGeneration}
          options={{
            gestureEnabled: false, // Disable swipe back gesture
            headerShown: false, // Optional: Hide the header
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
