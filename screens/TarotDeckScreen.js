import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { registerUser } from '../services/api';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4; // Increased card width
const CARD_HEIGHT = height * 0.3; // Increased card height
const VISIBLE_CARDS = 20; // More cards for the arc

// Placeholder tarot card data
const tarotCards = [
    { id: '1', name: 'The Fool' },
    { id: '2', name: 'The Magician' },
    { id: '3', name: 'The High Priestess' },
    { id: '4', name: 'The Empress' },
    { id: '5', name: 'The Emperor' },
    { id: '6', name: 'The Hierophant' },
    { id: '7', name: 'The Lovers' },
    { id: '8', name: 'The Chariot' },
    { id: '9', name: 'Strength' },
    { id: '10', name: 'The Hermit' },
    { id: '11', name: 'Wheel of Fortune' },
    { id: '12', name: 'Justice' },
    { id: '13', name: 'The Hanged Man' },
    { id: '14', name: 'Death' },
    { id: '15', name: 'Temperance' },
    { id: '16', name: 'The Devil' },
    { id: '17', name: 'The Tower' },
    { id: '18', name: 'The Star' },
    { id: '19', name: 'The Moon' },
    { id: '20', name: 'The Sun' },
  ];
  

const TarotDeckScreen = ({ navigation, route }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Get user data from previous screens
  const userData = {
    email: route.params?.email,
    nickname: route.params?.nickname,
    gender: route.params?.gender,
    birthday: route.params?.birthday,
    selectedCard: null, // Will be updated when user selects a card
  };

  // Generate positions for cards in a semicircle, now using tarotCards array
  const cards = tarotCards.map((tarotCard, index) => {
    const angle = (Math.PI / 2) * (index / (tarotCards.length - 3)) - Math.PI / 1.5;
    const radius = height * 0.3;
    
    return {
      ...tarotCard, // Spread the tarot card data (id and name)
      rotation: ((index / (tarotCards.length - 1)) * 90 - 45),
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle) + height * 0.2,
    };
  });

  const handleCardSelection = async (card) => {
    setSelectedCard(card);
    
    try {
      setIsRegistering(true);
      // Update userData with selected card
      const updatedUserData = {
        ...userData,
        selectedCard: {
          id: card.id,
          name: card.name,
        },
      };

      // Send data to backend
      const response = await registerUser(updatedUserData);
      
      // Navigate to next screen with response data
      navigation.navigate('Chat', { 
        userData: response,
        selectedCard: card 
      });
    } catch (error) {
      console.error('Error registering user:', error);
      // Handle error (show alert, etc.)
    } finally {
      setIsRegistering(false);
    }
  };

  const renderCard = (card, index) => {
    const isSelected = selectedCard?.id === card.id;

    return (
      <Animated.View
        key={card.id}
        style={[
          styles.card,
          {
            transform: [
              { translateX: card.x },
              { translateY: card.y },
              { rotate: `${card.rotation}deg` },
            ],
            zIndex: tarotCards.length - index,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleCardSelection(card)}
          disabled={isRegistering}
        >
          <View style={styles.cardInner}>
            <View style={[
              styles.cardPattern,
              isSelected && styles.selectedCard
            ]} />
            {isSelected && (
              <View style={styles.cardNameContainer}>
                <Text style={styles.cardName}>{card.name}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tarot Deck Preview</Text>
        <Text style={styles.subtitle}>
          Hi, your Tarot deck is ready!{'\n'}
          This is the deck you'll be using for your future readings.
        </Text>

        <View style={styles.deckContainer}>
          {cards.map((card, index) => renderCard(card, index))}
        </View>

        {selectedCard && (
          <Text style={styles.selectedCardText}>
            Selected: {selectedCard.name}
          </Text>
        )}

        <TouchableOpacity
          style={styles.beginButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.beginButtonText}>Begin Tarot Journey</Text>
        </TouchableOpacity>
      
        {isRegistering && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#5C5CFF" />
            <Text style={styles.loadingText}>Registering...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  cardPattern: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#1a1a1a',
    borderWidth: 4,
    borderColor: '#B8860B', // Dark golden color
    opacity: 0.5,
  },
  beginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#5C5CFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  beginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  selectedCard: {
    borderColor: '#FFD700', // Bright gold for selected card
    borderWidth: 6,
    opacity: 0.8,
  },
  cardNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  cardName: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedCardText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  chatButton: {
    backgroundColor: '#f4511e',
    marginBottom: 20,
    marginTop: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});

export default TarotDeckScreen; 
