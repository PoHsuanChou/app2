import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import NicknameScreen from './screens/NicknameScreen';
import GenderScreen from './screens/GenderScreen';
import BirthdayScreen from './screens/BirthdayScreen';
import TarotDeckScreen from './screens/TarotDeckScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();

const FirstScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Your Tarot Journey</Text>
      <Text style={styles.description}>
        Log in to unlock all features. To better understand you and provide personalized Tarot guidance, we'll ask you a few questions. Then, choose your favorite Tarot deck and embark on your spiritual journey.
      </Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Login" 
          color="#6495ED" 
          onPress={() => navigation.navigate('Login')}
        />
        <Button 
          title="測試聊天" 
          color="#f4511e" 
          onPress={() => navigation.navigate('Chat')}
        />
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
        <Stack.Screen name="TarotDeck" component={TarotDeckScreen} />
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
