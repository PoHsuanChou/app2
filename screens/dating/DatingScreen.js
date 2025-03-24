import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  Animated,
  PanResponder,
  TouchableOpacity,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDatingUsers } from '../../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 120;
const BASE_URL = 'http://192.168.68.52:8080'; // 使用與 api.js 相同的 BASE_URL

const DatingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const position = useRef(new Animated.ValueXY()).current;
  const lastGesture = useRef({ dx: 0, dy: 0 });
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });
  const [showMatch, setShowMatch] = useState(false);
  const matchScale = useRef(new Animated.Value(0)).current;
  const matchOpacity = useRef(new Animated.Value(0)).current;
  const sparklesOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUserId = await AsyncStorage.getItem('userId') || 'defaultUserId'; // 從 AsyncStorage 獲取
      const fetchedUsers = await fetchDatingUsers(currentUserId);
      console.log("Fetched users: ", fetchedUsers);
      setUsers(fetchedUsers || []);
    } catch (err) {
      setError('無法載入用戶資料');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        lastGesture.current = gesture;
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const showMatchAnimation = () => {
    setShowMatch(true);
    matchScale.setValue(0);
    matchOpacity.setValue(0);
    sparklesOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(matchScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(matchOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(sparklesOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const swipeRight = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId') || 'defaultUserId';
      const response = await fetch(`${BASE_URL}/api/dating/swipe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          targetUserId: users[currentIndex].id,
          action: 'LIKE',
        }),
      });

      if (!response.ok) {
        throw new Error('Swipe failed');
      }

      const data = await response.json();
      Animated.timing(position, {
        toValue: { x: SCREEN_WIDTH + 100, y: lastGesture.current.dy },
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        if (data.isMatch) {
          showMatchAnimation();
        } else {
          nextCard();
        }
      });
    } catch (error) {
      console.error('Swipe right error:', error);
      resetPosition();
    }
  };

  const swipeLeft = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId') || 'defaultUserId';
      await fetch(`${BASE_URL}/api/dating/swipe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          targetUserId: users[currentIndex].id,
          action: 'DISLIKE',
        }),
      });

      Animated.timing(position, {
        toValue: { x: -SCREEN_WIDTH - 100, y: lastGesture.current.dy },
        duration: 250,
        useNativeDriver: true,
      }).start(() => nextCard());
    } catch (error) {
      console.error('Swipe left error:', error);
      resetPosition();
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const nextCard = () => {
    setCurrentIndex(currentIndex + 1);
    position.setValue({ x: 0, y: 0 });
  };

  const renderCard = () => {
    if (loading) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreCardsText}>載入中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreCardsText}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
            <Text style={styles.refreshButtonText}>重試</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!users || currentIndex >= users.length) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreCardsText}>沒有更多用戶了</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              setCurrentIndex(0);
              loadUsers();
            }}
          >
            <Text style={styles.refreshButtonText}>重新整理</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const user = users[currentIndex];
    
    // 處理圖片 URL
    const imageUrl = user.image.startsWith('http') 
      ? user.image 
      : `${BASE_URL}/static/uploads/${user.image.split('/').pop()}`;

    const likeOpacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    });
    const nopeOpacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <Image 
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          // 添加加載指示器和錯誤處理
          loadingIndicatorSource={require('../../assets/placeholder.png')}
          onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
        />
        <View style={styles.cardContent}>
          <Text style={styles.name}>
            {user.name}, {user.age}
          </Text>
          <Text style={styles.bio}>{user.bio || 'No bio available'}</Text>
        </View>

        <Animated.View style={[styles.likeStamp, { opacity: likeOpacity }]}>
          <Text style={styles.stampText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.nopeStamp, { opacity: nopeOpacity }]}>
          <Text style={styles.stampText}>NOPE</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      <View style={styles.cardContainer}>{renderCard()}</View>

      {showMatch && (
        <Animated.View style={[styles.matchOverlay, { opacity: matchOpacity }]}>
          <Animated.Image
            source={require('../../assets/tarot-ai-avatar.png')}
            style={[
              styles.sparkles,
              {
                opacity: sparklesOpacity,
                transform: [{ scale: matchScale }],
              },
            ]}
          />
          <Animated.Text style={[styles.matchText, { transform: [{ scale: matchScale }] }]}>
            It's a Match!
          </Animated.Text>
          <Animated.View style={[styles.matchProfiles, { opacity: sparklesOpacity }]}>
            <Image
              source={{ 
                uri: users[currentIndex].image.startsWith('http')
                  ? users[currentIndex].image
                  : `${BASE_URL}/static/uploads/${users[currentIndex].image.split('/').pop()}`
              }}
              style={styles.matchProfile}
            />
            <Image
              source={require('../../assets/tarot-ai-avatar.png')}
              style={styles.matchProfile}
            />
          </Animated.View>
          <TouchableOpacity
            style={styles.keepSwiping}
            onPress={() => {
              setShowMatch(false);
              nextCard();
            }}
          >
            <Text style={styles.keepSwipingText}>Keep Swiping</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.button} onPress={swipeLeft}>
          <Text style={styles.buttonIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={swipeRight}>
          <Text style={styles.buttonIcon}>♥</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  backText: {
    color: 'white',
    fontSize: 28,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
    backgroundColor: '#2A2A2A',
  },
  cardContent: {
    padding: 20,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bio: {
    color: '#ddd',
    fontSize: 16,
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 30,
    color: 'white',
  },
  likeStamp: {
    position: 'absolute',
    top: 50,
    right: 40,
    transform: [{ rotate: '30deg' }],
  },
  nopeStamp: {
    position: 'absolute',
    top: 50,
    left: 40,
    transform: [{ rotate: '-30deg' }],
  },
  stampText: {
    borderWidth: 4,
    borderColor: '#4CAF50',
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: 'bold',
    padding: 10,
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMoreCardsText: {
    color: '#666',
    fontSize: 18,
    marginBottom: 20,
  },
  refreshButton: {
    padding: 15,
    backgroundColor: '#5C5CFF',
    borderRadius: 25,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchText: {
    color: 'white',
    fontSize: 44,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  sparkles: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    opacity: 0.8,
  },
  matchProfiles: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  matchProfile: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
    margin: 10,
  },
  keepSwiping: {
    backgroundColor: '#5C5CFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  keepSwipingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DatingScreen;