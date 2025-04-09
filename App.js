import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/auth/LoginScreen';
import NicknameScreen from './screens/register/NicknameScreen';
import GenderScreen from './screens/register/GenderScreen';
import BirthdayScreen from './screens/register/BirthdayScreen';
// import TarotDeckScreen from './screens/register/TarotDeckScreen';
import ChatScreen from './screens/dating/ChatScreen';
import MainScreen from './screens/main/MainScreen';
import TarotCardsScreen from './screens/tarot/TarotCardsScreen';
import SettingsScreen from './screens/profile/SettingsScreen';
import ProfilePictureScreen from './screens/register/ProfilePictureScreen';
import DatingScreen from './screens/dating/DatingScreen';
import CardRevealScreen from './screens/tarot/CardRevealScreen';
import MatchChatScreen from './screens/dating/MatchChatScreen';
import InterestsScreen from './screens/register/InterestsScreen';
import UserProfileScreen from './screens/register/UserProfileScreen';
import ReadyToRegisterScreen from './screens/register/ReadyToRegisterScreen';
import TarotChatScreen from './screens/tarot/TarotChatScreen';

const Stack = createStackNavigator();

const FirstScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Your Tarot Journey</Text>
      <Text style={styles.description}>
        Log in to unlock all features.
      </Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Login" 
          color="#6495ED" 
          onPress={() => navigation.navigate('Login')}
        />
        {/* <Button 
          title="測試聊天" 
          color="#f4511e" 
          onPress={() => navigation.navigate('Chat')}
        /> */}
      </View>
    </View>
  );
};

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'black' }
        }}
      >
        <Stack.Screen name="Home" component={FirstScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Nickname" component={NicknameScreen} />
        <Stack.Screen name="Gender" component={GenderScreen} />
        <Stack.Screen name="Birthday" component={BirthdayScreen} />
        <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} />
        <Stack.Screen name="TarotDeck" component={ReadyToRegisterScreen} />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{
            title: '塔羅對話',
            headerStyle: {
              backgroundColor: '#1C1C1E',
            },
            headerTintColor: '#fff',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainScreen}
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="TarotCards" 
          component={TarotCardsScreen}
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="dating" 
          component={DatingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CardReveal" 
          component={CardRevealScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MatchChat" 
          component={MatchChatScreen}
          options={{
            headerShown: true,
            title: "",  // 我們會動態設置標題
            headerStyle: {
              backgroundColor: '#1C1C1E',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen name="Interests" component={InterestsScreen} />
        <Stack.Screen 
          name="UserProfile" 
          component={UserProfileScreen}
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen 
          name="TarotChat" 
          component={TarotChatScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1C1C1E',
            },
            headerTintColor: '#ffd700',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
});

export default App;
