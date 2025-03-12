// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Animated,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from 'react-native';
// import { registerUser } from '../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width, height } = Dimensions.get('window');

// // Import your card image
// const cardImage = require('../assets/card-back.png'); // Update this path to match your asset location

// const TarotDeckScreen = ({ navigation, route }) => {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [isFlipped, setIsFlipped] = useState(false);
//   const cardScale = useRef(new Animated.Value(1)).current;
//   const cardOpacity = useRef(new Animated.Value(1)).current;
//   const messageOpacity = useRef(new Animated.Value(0)).current;
//   const buttonOpacity = new Animated.Value(1);

//   const flipCard = () => {
//     Animated.sequence([
//       // First flip the card
//       Animated.spring(cardScale, {
//         toValue: 0,
//         friction: 8,
//         tension: 10,
//         useNativeDriver: true,
//       }),
//       // Then fade in the message
//       Animated.timing(messageOpacity, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       })
//     ]).start(() => setIsFlipped(true));
//   };

//   useEffect(() => {
//     // Start entrance animations
//     Animated.sequence([
//       Animated.parallel([
//         Animated.timing(cardScale, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(cardOpacity, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ]),
//       Animated.timing(buttonOpacity, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const handleBeginJourney = async () => {
//     if (!isFlipped) {
//       flipCard();
//       return;
//     }

//     try {
//       setIsRegistering(true);
      
//       // 将生日转换为 Java 后端可接收的时间戳格式
//       const formatBirthday = (birthdayData) => {
//         const monthNames = [
//           'January', 'February', 'March', 'April', 'May', 'June',
//           'July', 'August', 'September', 'October', 'November', 'December'
//         ];
//         const monthIndex = monthNames.indexOf(birthdayData.month);
//         const day = parseInt(birthdayData.day);
//         const year = parseInt(birthdayData.year);

//         // 创建 Date 对象并设置为当天开始时间 (UTC)
//         const date = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0));
        
//         // 返回 ISO 字符串，Spring Boot 可以直接解析
//         return date.toISOString();
//       };

//       // 准备注册数据
//       const registrationData = {
//         email: route.params.email,
//         password: route.params.password || null,
//         nickname: route.params.nickname,
//         bio: route.params.bio,
//         gender: route.params.gender,
//         birthday: formatBirthday(route.params.birthday),
//         zodiacSign: route.params.birthday.zodiacSign,
//         profileImage: route.params.profileImage,
//         interests: route.params.interests,
//         isGoogleLogin: route.params.isGoogleLogin
//       };

//       console.log('Sending registration data:', registrationData);

//       // 发送注册请求
//       const response = await fetch('http://localhost:8080/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(registrationData)
//       });

//       const data = await response.json();
//       console.log('gggggg:', data);

//       if (!response.ok) {
//         throw new Error(data.message || 'Registration failed');
//       }

//       // 检查响应是否成功
//       if (data.success) {
//         // 保存 token
//         if (data.token) {
//           await AsyncStorage.setItem('userToken', data.token);
//         }

//         // 导航到主页面
//         navigation.navigate('Main', { 
//           userData: data.user,
//           token: data.token,
//           isGoogle: data.isGoogle,
//           email: data.email
//         });
//       } else {
//         throw new Error(data.message || 'Registration failed');
//       }

//     } catch (error) {
//       console.error('Error registering user:', error);
//       Alert.alert('Error', error.message || 'Failed to complete registration');
//     } finally {
//       setIsRegistering(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Begin Your{'\n'}Tarot Journey</Text>
//         <Text style={styles.subtitle}>Tap the card to reveal your destiny</Text>
//       </View>

//       <View style={styles.centerContainer}>
//         <TouchableOpacity 
//           onPress={flipCard}
//           activeOpacity={1}
//           disabled={isFlipped}
//         >
//           <Animated.View
//             style={[
//               styles.cardContainer,
//               {
//                 transform: [{ scale: cardScale }],
//                 opacity: cardScale,
//               },
//             ]}
//           >
//             <Image 
//               source={cardImage}
//               style={styles.cardImage}
//               resizeMode="cover"
//             />
//           </Animated.View>
//         </TouchableOpacity>

//         <Animated.View
//           style={[
//             styles.messageContainer,
//             {
//               opacity: messageOpacity,
//             },
//           ]}
//         >
//           <Text style={styles.messageText}>Let's Go!</Text>
//           <Text style={styles.messageSubtext}>Your journey awaits...</Text>
//         </Animated.View>
//       </View>

//       <Animated.View style={{ opacity: buttonOpacity }}>
//         <TouchableOpacity
//           style={[
//             styles.beginButton,
//             !isFlipped && styles.beginButtonInitial
//           ]}
//           onPress={handleBeginJourney}
//           disabled={isRegistering}
//         >
//           <Text style={styles.beginButtonText}>
//             {isRegistering ? 'Creating Your Journey...' : 
//              isFlipped ? 'Begin Journey' : 'Tap to Reveal'}
//           </Text>
//           {isRegistering && (
//             <ActivityIndicator color="white" style={styles.loader} />
//           )}
//         </TouchableOpacity>
//       </Animated.View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   header: {
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   title: {
//     color: 'white',
//     fontSize: 40,
//     fontWeight: 'bold',
//     lineHeight: 48,
//   },
//   subtitle: {
//     color: '#666',
//     fontSize: 16,
//     marginTop: 10,
//   },
//   centerContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cardContainer: {
//     width: width * 0.6,
//     height: height * 0.4,
//     position: 'relative',
//     perspective: 2000,
//   },
//   card: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 20,
//     backgroundColor: 'transparent',
//     overflow: 'hidden',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   cardFace: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backfaceVisibility: 'hidden',
//     backgroundColor: '#1a1a1a',
//     transform: [{ perspective: 2000 }],
//   },
//   cardImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 20,
//   },
//   beginButton: {
//     flexDirection: 'row',
//     width: '90%',
//     height: 56,
//     backgroundColor: '#5C5CFF',
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 40,
//     marginHorizontal: 20,
//   },
//   beginButtonInitial: {
//     backgroundColor: '#4A4A4A',
//   },
//   beginButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//     marginRight: 10,
//   },
//   loader: {
//     marginLeft: 10,
//   },
//   messageContainer: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   messageText: {
//     color: '#FFD700',
//     fontSize: 48,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   messageSubtext: {
//     color: '#666',
//     fontSize: 18,
//     textAlign: 'center',
//   },
// });

// export default TarotDeckScreen; 
