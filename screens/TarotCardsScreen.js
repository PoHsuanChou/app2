import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Image, // Import Image component
} from 'react-native';

const { width, height } = Dimensions.get('window');

const cardBackImage = require('../assets/card-back.png'); // Add your card back image

const TarotCardsScreen = ({ navigation }) => {
  const [rotation, setRotation] = useState(0);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const isRotating = useRef(false);

  const startRotationAnimation = () => {
    if (!isRotating.current) return;

    // Reset the Animated.Value when starting a new rotation
    rotationAnim.setValue(0);

    Animated.timing(rotationAnim, {
      toValue: 360,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      // If still rotating, reset value and start again
      if (isRotating.current) {
        setRotation(prev => prev + 360);
        startRotationAnimation();
      }
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      isRotating.current = true;
      startRotationAnimation();
    },
    onPanResponderRelease: () => {
      isRotating.current = false;
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  // Generate positions for cards in a circular arc
  const generateCardPositions = () => {
    const cards = [];
    const totalCards = 32;
    const centerX = width * 0.5; // Center horizontally
    const centerY = height * 0.5; // Center vertically
    const radius = width * 0.5;
    const startAngle = -Math.PI * 0.73;
    const endAngle = Math.PI * 1.2;
    
    for (let i = 0; i < totalCards; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / (totalCards - 1);
      // Calculate positions relative to center
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const rotation = (angle * 180) / Math.PI + 270;

      cards.push({
        id: i,
        position: {
          x: x - (width * 0.05), // Adjust for card width
          y: y - (height * 0.075), // Adjust for card height
        },
        rotation: rotation,
        image: `card_${i + 1}`,
        angle: angle
      });
    }
    return cards;
  };

  const cardPositions = generateCardPositions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cards</Text>
      </View>

      <View style={styles.centerContainer}>
        <Animated.View 
          style={[styles.cardsWrapper, {
            transform: [{
              rotate: rotationAnim.interpolate({
                inputRange: [0, 360],
                outputRange: [`${rotation}deg`, `${rotation + 360}deg`]
              })
            }]
          }]}
          {...panResponder.panHandlers}
        >
          {cardPositions.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: card.position.x },
                    { translateY: card.position.y },
                    { rotate: `${card.rotation}deg` }
                  ],
                },
              ]}
              onPress={() => handleCardSelect(card.id)}
            >
              <Image 
                source={cardBackImage}
                style={styles.cardImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 2000, // Ensure header is above cards
    backgroundColor: 'rgba(0,0,0,0.8)', // Optional: add slight background to make text more readable
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: 'white',
    fontSize: 28,
  },
  headerTitle: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 48,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 200, // Add space for header
  },
  cardsWrapper: {
    position: 'absolute',
    width: width * 1.4, // Make sure it's big enough to contain all cards
    height: height * 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: width * 0.1,
    height: height * 0.15,
    left: '50%', // Center the card
    top: '50%', // Center the card
    marginLeft: -(width * 0.05), // Half of card width
    marginTop: -(height * 0.075), // Half of card height
    backgroundColor: 'transparent',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default TarotCardsScreen;