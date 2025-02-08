import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { registerUser } from '../services/api';

const { width, height } = Dimensions.get('window');

const TarotDeckScreen = ({ navigation, route }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const cardScale = new Animated.Value(0);
  const cardOpacity = new Animated.Value(0);
  const buttonOpacity = new Animated.Value(0);

  useEffect(() => {
    // Start entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBeginJourney = async () => {
    try {
      setIsRegistering(true);
      const response = await registerUser(route.params);
      
      // Success animation
      Animated.parallel([
        Animated.timing(cardScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.navigate('Main', { 
          userData: response.userData,
        });
      });

    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'Failed to complete registration');
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Begin Your{'\n'}Tarot Journey</Text>
        <Text style={styles.subtitle}>Your spiritual path awaits</Text>
      </View>

      <View style={styles.centerContainer}>
        <Animated.View 
          style={[
            styles.card,
            {
              transform: [{ scale: cardScale }],
              opacity: cardOpacity,
            }
          ]}
        >
          <View style={styles.cardInner}>
            <View style={styles.cardPattern}>
              <View style={styles.patternOverlay} />
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: buttonOpacity }}>
        <TouchableOpacity
          style={styles.beginButton}
          onPress={handleBeginJourney}
          disabled={isRegistering}
        >
          <Text style={styles.beginButtonText}>
            {isRegistering ? 'Creating Your Journey...' : 'Begin Tarot Journey'}
          </Text>
          {isRegistering && (
            <ActivityIndicator color="white" style={styles.loader} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 48,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.6,
    height: height * 0.4,
    borderRadius: 20,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  cardInner: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#B8860B',
    borderRadius: 20,
    padding: 2,
  },
  cardPattern: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  patternOverlay: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFD700',
    opacity: 0.3,
    backgroundColor: '#1a1a1a',
  },
  beginButton: {
    flexDirection: 'row',
    width: '90%',
    height: 56,
    backgroundColor: '#5C5CFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    marginHorizontal: 20,
  },
  beginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  loader: {
    marginLeft: 10,
  },
});

export default TarotDeckScreen; 
