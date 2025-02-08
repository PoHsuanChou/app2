import React, { useState, useEffect, useRef } from 'react';
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
  Image,
} from 'react-native';
import { registerUser } from '../services/api';

const { width, height } = Dimensions.get('window');

// Import your card image
const cardImage = require('../assets/card-back.png'); // Update this path to match your asset location

const TarotDeckScreen = ({ navigation, route }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = new Animated.Value(1);

  const flipCard = () => {
    if (!isFlipped) {
      Animated.sequence([
        // First flip the card
        Animated.spring(cardScale, {
          toValue: 0,
          friction: 8,
          tension: 10,
          useNativeDriver: true,
        }),
        // Then fade in the message
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start(() => setIsFlipped(true));
    }
  };

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
    if (!isFlipped) {
      flipCard();
      return;
    }

    try {
      setIsRegistering(true);
      const response = await registerUser(route.params);
      // Directly navigate to Main screen
      navigation.navigate('Main', { 
        userData: response.userData,
      });
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'Failed to complete registration');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Begin Your{'\n'}Tarot Journey</Text>
        <Text style={styles.subtitle}>Tap the card to reveal your destiny</Text>
      </View>

      <View style={styles.centerContainer}>
        <TouchableOpacity onPress={flipCard} activeOpacity={1}>
          <Animated.View
            style={[
              styles.cardContainer,
              {
                transform: [{ scale: cardScale }],
                opacity: cardScale, // Link opacity to scale
              },
            ]}
          >
            <Image 
              source={cardImage}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: messageOpacity,
            },
          ]}
        >
          <Text style={styles.messageText}>Let's Go!</Text>
          <Text style={styles.messageSubtext}>Your journey awaits...</Text>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: buttonOpacity }}>
        <TouchableOpacity
          style={styles.beginButton}
          onPress={handleBeginJourney}
          disabled={isRegistering || !isFlipped}
        >
          <Text style={styles.beginButtonText}>
            {isRegistering ? 'Creating Your Journey...' : 'Begin Journey'}
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
  cardContainer: {
    width: width * 0.6,
    height: height * 0.4,
    position: 'relative',
    perspective: 2000,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    backgroundColor: '#1a1a1a',
    transform: [{ perspective: 2000 }],
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
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
  messageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: '#FFD700',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  messageSubtext: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default TarotDeckScreen; 
