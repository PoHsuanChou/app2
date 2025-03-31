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
import { fetchDatingUsers, swipeUser } from '../../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 120;
const BASE_URL = 'http://192.168.68.52:8080';

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
  const [matchedUser, setMatchedUser] = useState(null);
  const matchScale = useRef(new Animated.Value(0)).current;
  const matchOpacity = useRef(new Animated.Value(0)).current;
  const sparklesOpacity = useRef(new Animated.Value(0)).current;
  
  // 使用useRef来保存最新的用户数据，避免异步操作中的状态问题
  const usersRef = useRef([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUserId = await AsyncStorage.getItem('userId') || 'defaultUserId';
      const fetchedUsers = await fetchDatingUsers(currentUserId);
      console.log("Fetched users: ", fetchedUsers);
  
      // 确保fetchedUsers是数组
      if (!Array.isArray(fetchedUsers)) {
        console.log('Invalid fetched users data:', fetchedUsers);
        setError('用户数据格式错误');
        setUsers([]);
        usersRef.current = [];
      } else {
        console.log('Setting users array with length:', fetchedUsers.length);
        setUsers(fetchedUsers);
        usersRef.current = fetchedUsers; // 同时更新ref
        
        // 验证状态更新
        setTimeout(() => {
          console.log('Verified users state after update:', users.length, 'usersRef:', usersRef.current.length);
        }, 100);
      }
    } catch (err) {
      setError('无法加载用户资料');
      console.error('Error loading users:', err);
      setUsers([]); // 失败时设置为空数组
      usersRef.current = []; // 同时更新ref
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
        console.log('Gesture DX:', gesture.dx, 'Current index:', currentIndex, 'Users available:', usersRef.current.length);
        
        if (gesture.dx > SWIPE_THRESHOLD) {
          console.log('Swiping right on user:', usersRef.current[currentIndex]?.id);
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          console.log('Swiping left on user:', usersRef.current[currentIndex]?.id);
          swipeLeft();
        } else {
          console.log('Resetting position');
          resetPosition();
        }
      },
    })
  ).current;

  const showMatchAnimation = (matchData) => {
    setMatchedUser(matchData);
    setShowMatch(true);
    
    // Reset animation values
    matchScale.setValue(0);
    matchOpacity.setValue(0);
    sparklesOpacity.setValue(0);

    // Create animation sequence with more dramatic effects
    Animated.sequence([
      // Fade in the overlay with a quick flash
      Animated.timing(matchOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Start parallel animations after overlay is visible
      Animated.parallel([
        // Pop up scale animation for "It's a Match!" text with bounce
        Animated.spring(matchScale, {
          toValue: 1.1,  // Slightly overshoot
          friction: 4,   // Less friction for more bounce
          tension: 40,
          useNativeDriver: true,
        }),
        // Delayed sparkles animation
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(sparklesOpacity, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Scale back to normal size
      Animated.spring(matchScale, {
        toValue: 1,
        friction: 6,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const swipeRight = async () => {
    console.log('Before swipeRight - currentIndex:', currentIndex, 'users state length:', users.length, 'usersRef length:', usersRef.current.length);
    
    // 使用ref获取最新的用户数据
    const currentUsers = usersRef.current;
    const indexToProcess = currentIndex;
    
    try {
      // 检查用户数据是否有效
      if (!currentUsers || currentUsers.length === 0 || indexToProcess < 0 || indexToProcess >= currentUsers.length) {
        console.log('Invalid state - users length:', currentUsers?.length, 'indexToProcess:', indexToProcess);
        setError('没有可滑动的用户');
        resetPosition();
        return;
      }
  
      const currentUser = currentUsers[indexToProcess];
      if (!currentUser || !currentUser.id) {
        console.log('Invalid user or missing ID at index:', indexToProcess);
        setError('用户数据无效');
        resetPosition();
        return;
      }
  
      const currentUserId = await AsyncStorage.getItem('userId') || 'defaultUserId';
      const targetUserId = currentUser.id;
      console.log('Swiping right on user ID:', targetUserId);
  
      const response = await swipeUser(currentUserId, targetUserId, 'LIKE');
      console.log('Swipe response:', response);
  
      // 保存响应数据以便在匹配界面使用
      const matchData = {
        user: currentUser,
        chatRoomId: response.chatRoomId
      };
      
      Animated.timing(position, {
        toValue: { x: SCREEN_WIDTH + 100, y: lastGesture.current.dy },
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        if (response.match) {
          // 传递匹配数据
          showMatchAnimation(matchData);
          // Store chatRoomId if needed
          if (response.chatRoomId) {
            AsyncStorage.setItem(`chatRoom_${targetUserId}`, response.chatRoomId);
          }
        } else {
          nextCard();
        }
      });
    } catch (error) {
      console.error('Swipe right error:', error);
      setError('无法完成右滑操作，请稍后重试');
      resetPosition();
    }
  };

  const swipeLeft = async () => {
    console.log('Before swipeLeft - currentIndex:', currentIndex, 'users state length:', users.length, 'usersRef length:', usersRef.current.length);
    
    // 使用ref获取最新的用户数据
    const currentUsers = usersRef.current;
    const indexToProcess = currentIndex;
    
    try {
      // 检查用户数据是否有效
      if (!currentUsers || currentUsers.length === 0 || indexToProcess < 0 || indexToProcess >= currentUsers.length) {
        console.log('Invalid state - users length:', currentUsers?.length, 'indexToProcess:', indexToProcess);
        setError('没有可滑动的用户');
        resetPosition();
        return;
      }
  
      const currentUser = currentUsers[indexToProcess];
      if (!currentUser || !currentUser.id) {
        console.log('Invalid user or missing ID at index:', indexToProcess);
        setError('用户数据无效');
        resetPosition();
        return;
      }
  
      const currentUserId = await AsyncStorage.getItem('userId') || 'defaultUserId';
      const targetUserId = currentUser.id;
      console.log('Swiping left on user ID:', targetUserId);
  
      await swipeUser(currentUserId, targetUserId, 'DISLIKE');
  
      Animated.timing(position, {
        toValue: { x: -SCREEN_WIDTH - 100, y: lastGesture.current.dy },
        duration: 250,
        useNativeDriver: true,
      }).start(() => nextCard());
    } catch (error) {
      console.error('Swipe left error:', error);
      setError('无法完成左滑操作，请稍后重试');
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
    const nextIndex = currentIndex + 1;
    console.log('Moving to next card - nextIndex:', nextIndex, 'users length:', usersRef.current.length);
    if (nextIndex >= usersRef.current.length) {
      console.log('No more users available');
      setCurrentIndex(nextIndex); // 允许超出，但UI会显示"没有更多用户"
    } else {
      setCurrentIndex(nextIndex);
    }
    position.setValue({ x: 0, y: 0 });
  };

  const renderCard = () => {
    if (loading) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreCardsText}>载入中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreCardsText}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
            <Text style={styles.refreshButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 使用usersRef检查还有没有用户
    if (!usersRef.current || usersRef.current.length === 0 || currentIndex >= usersRef.current.length) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreCardsText}>没有更多用户了</Text>
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

    const user = usersRef.current[currentIndex];
    
    // 改进图片URL处理
    let imageUrl = user.image;

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
        <Animated.View 
          style={[
            styles.matchOverlay, 
            { opacity: matchOpacity }
          ]}
        >
          <Animated.View
            style={[
              styles.matchContent,
              { transform: [{ scale: matchScale }] }
            ]}
          >
            <Animated.Text style={styles.matchText}>
              恭喜配對成功!
            </Animated.Text>
            <Animated.Text style={styles.matchSubText}>
              你们看起来很合拍!
            </Animated.Text>
            <TouchableOpacity
              style={[styles.keepSwiping, { marginTop: 30 }]}
              onPress={() => {
                setShowMatch(false);
                nextCard();
              }}
            >
              <Text style={styles.keepSwipingText}>继续浏览</Text>
            </TouchableOpacity>
          </Animated.View>
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
  matchContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sparkles: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    opacity: 0.8,
    transform: [{ scale: 1.2 }],
  },
  matchText: {
    color: 'white',
    fontSize: 44,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  matchSubText: {
    color: '#cccccc',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  matchProfiles: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  matchProfile: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
    margin: 10,
  },
  matchButtons: {
    alignItems: 'center',
    marginTop: 30,
  },
  sendMessageButton: {
    backgroundColor: '#5C5CFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sendMessageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  keepSwiping: {
    backgroundColor: '#5C5CFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  keepSwipingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DatingScreen;