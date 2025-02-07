import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image, // Import Image component
} from 'react-native';

const { width, height } = Dimensions.get('window');

const TarotCardsScreen = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  // Generate positions for cards in a circular arc
  const generateCardPositions = () => {
    const cards = [];
    const totalCards = 32;
    const centerX = width / 2;
    const centerY = height * 0.75; // Adjust centerY to move the arc lower
    const radius = width * 0.7; // Adjust radius to control the arc size
    const startAngle = -Math.PI * 0.3; // Adjust start angle for wider arc
    const endAngle = Math.PI * 1.3; // Adjust end angle for wider arc
    
    for (let i = 0; i < totalCards; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / (totalCards - 1);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const rotation = (angle * 180) / Math.PI + 90;

      cards.push({
        id: i,
        position: {
          x: x - (width * 0.12), // Adjust for card width, slightly larger
          y: y - (height * 0.16), // Adjust for card height, slightly larger
        },
        rotation: rotation,
        image: `card_${i + 1}`, // Placeholder for card image name
      });
    }
    return cards;
  };

  const cardPositions = generateCardPositions();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Swipe to{'\n'}See All Cards</Text>
      <Text style={styles.subtitle}>Tap to choose card</Text>

      <View style={styles.cardsContainer}>
        {cardPositions.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              {
                left: card.position.x,
                top: card.position.y,
                transform: [
                  { rotate: `${card.rotation}deg` }
                ],
                zIndex: cardPositions.length - card.id, // Use card.id for zIndex
              },
            ]}
          >
            <Image
              source={{ uri: card.image }} // Use card image source
              style={styles.cardImage}
              resizeMode="contain" // Or "cover" depending on your needs
            />
            <View style={styles.cardInner}>
              <View style={styles.cardPattern}>
                <View style={styles.patternOverlay} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
  backText: {
    color: 'white',
    fontSize: 28,
  },
  title: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 80,
    marginLeft: 20,
    lineHeight: 48,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    marginLeft: 20,
  },
  cardsContainer: {
    flex: 1,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: width * 0.1,
    height: height * 0.15,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent', // Make card background transparent
  },
  cardInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B8860B',
    borderRadius: 4,
    padding: 1,
  },
  cardPattern: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
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
  cardImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});

export default TarotCardsScreen; 