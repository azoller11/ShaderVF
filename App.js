

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ShaderListScreen from './screens/ShaderListScreen';
import TextEditorScreen from './screens/TextEditorScreen';
import Create3DScreen from './screens/Create3DScreen';
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';
import EnviornmentScreen from './screens/EnviornmentScreen';
import SetupSceneScreen from './screens/SetupSceneScreen';
import TutorialScreen from './screens/TutorialScreen';

export default function App() {

  const Stack = createNativeStackNavigator();

  return (
     <NavigationContainer>
      <Stack.Navigator>

     
      <Stack.Screen options={{headerShown:false}} name= 'Home' component={MainScreen} />
      <Stack.Screen options={{headerShown:false}} name= 'Main' component={MainScreen} />

      <Stack.Screen options={{headerShown:false}} name= 'ShaderList' component={ShaderListScreen} />

      <Stack.Screen options={{headerShown:false}} name= 'Create3D' component={Create3DScreen} />

      <Stack.Screen options={{headerShown:false}} name= 'TextEditor' component={TextEditorScreen} />
      <Stack.Screen options={{headerShown:false}} name= 'Settings' component={SettingsScreen} />

      <Stack.Screen options={{headerShown:false}} name= 'Enviornment' component={EnviornmentScreen} />

      <Stack.Screen options={{headerShown:false}} name= 'SetupScene' component={SetupSceneScreen} />

      <Stack.Screen options={{headerShown:false}} name= 'Tutorial' component={TutorialScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
