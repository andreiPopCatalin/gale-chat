import React, { useEffect } from "react";
import * as Font from 'expo-font';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import WelcomeScreen from "./screens/WelcomeScreen";
import Dashboard from "./screens/Dashboard";
import ChatScreen from "./screens/ChatScreen";
import { loadAllSounds } from './utils/soundPlayer';

const Stack = createStackNavigator();



export default function App() {


  //load sounds and fonts
  useEffect(() => {
    const loadResources = async () => {
      await loadAllSounds();
      await Font.loadAsync({
        'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
        'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
        'Lato-Italic': require('./assets/fonts/Lato-Italic.ttf'),
        'Lato-BoldItalic': require('./assets/fonts/Lato-BoldItalic.ttf'),
      });
    };

    loadResources();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, ...TransitionPresets.ModalSlideFromBottomIOS, }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
