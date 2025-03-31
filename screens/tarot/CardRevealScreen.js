import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { tarotApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.8;
const cardHeight = cardWidth * 1.5; // 保持卡片的長寬比

const CardRevealScreen = ({ route, navigation }) => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReversed] = useState(Math.random() < 0.5); // 隨機決定正逆位
  const { cardId } = route.params;

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const data = await tarotApi.getCardDetails(cardId);
        setCardData(data);
      } catch (error) {
        console.error('Error fetching card:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [cardId]);

  const handleConsultation = () => {
    navigation.navigate('TarotChat', { 
      cardId: cardId,
      cardName: cardData.name,
      isReversed: isReversed
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  if (!cardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load card data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('Main')}
      >
        <Ionicons name="arrow-back" size={30} color="#ffd700" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <View style={styles.cardContainer}>
          <Image
            source={{ uri: cardData.imageUrl }}
            style={[
              styles.cardImage,
              isReversed && styles.reversedCard
            ]}
            resizeMode="contain"
          />
          <Text style={styles.cardName}>
            {cardData.name}
            {isReversed ? ' (Reversed)' : ''}
          </Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{cardData.description}</Text>

            <Text style={styles.sectionTitle}>Meaning</Text>
            <View style={styles.meaningBox}>
              <Text style={styles.meaningText}>
                {isReversed ? cardData.meanings.reversed : cardData.meanings.upright}
              </Text>
            </View>

            <View style={styles.additionalInfo}>
              <Text style={styles.infoText}>Category: {cardData.category}</Text>
              <Text style={styles.infoText}>Element: {cardData.elementalAffinity}</Text>
              {cardData.zodiacAffinity && (
                <Text style={styles.infoText}>
                  Zodiac: {cardData.zodiacAffinity.join(', ')}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.consultButton}
            onPress={handleConsultation}
          >
            <Text style={styles.consultButtonText}>
              Get Personal Reading
            </Text>
            <Text style={styles.consultButtonSubText}>
              1-on-1 Tarot Consultation
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // 深色背景
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  cardContainer: {
    alignItems: 'center',
    padding: 20,
  },
  cardImage: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: '#2d2d2d',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  cardName: {
    fontSize: 32, // 增大字體
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#ffd700', // 金色標題
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#2d2d2d', // 深灰色背景
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24, // 增大字體
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#ffd700', // 金色標題
  },
  description: {
    fontSize: 18, // 增大字體
    lineHeight: 28,
    marginBottom: 25,
    color: '#ffffff', // 白色文字
  },
  meaningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  meaningBox: {
    padding: 20,
    backgroundColor: '#3d3d3d',
    borderRadius: 12,
    marginBottom: 25,
  },
  meaningTitle: {
    fontSize: 20, // 增大字體
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffd700', // 金色標題
  },
  meaningText: {
    fontSize: 16, // 增大字體
    color: '#ffffff', // 白色文字
    lineHeight: 24,
  },
  additionalInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#3d3d3d', // 稍微淺一點的深灰色
    borderRadius: 12,
  },
  infoText: {
    fontSize: 16, // 增大字體
    color: '#ffffff', // 白色文字
    marginBottom: 8,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reversedCard: {
    transform: [{ rotate: '180deg' }],
  },
  consultButton: {
    width: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 15,
    padding: 20,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  consultButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  consultButtonSubText: {
    fontSize: 16,
    color: '#1a1a1a',
    opacity: 0.8,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default CardRevealScreen; 