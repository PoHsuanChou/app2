// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Image,
//   Animated,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import { tarotApi } from '../services/api';

// const { width, height } = Dimensions.get('window');

// // Add your tarot card meanings
// const tarotMeanings = {
//   0: {
//     name: "The Fool",
//     meaning: "New beginnings, spontaneity, faith, apparent foolishness",
//     description: "Take a leap of faith into new adventures. Trust your instincts and embrace new opportunities."
//   },
//   // Add more card meanings...
// };

// const CardRevealScreen = ({ navigation, route }) => {
//   const [isFlipped, setIsFlipped] = useState(false);
//   const [cardData, setCardData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const { cardId } = route.params;
//   const flipAnim = useRef(new Animated.Value(0)).current;

//   const frontInterpolate = flipAnim.interpolate({
//     inputRange: [0, 180],
//     outputRange: ['0deg', '180deg'],
//   });

//   const backInterpolate = flipAnim.interpolate({
//     inputRange: [0, 180],
//     outputRange: ['180deg', '360deg'],
//   });

//   const fetchCardData = async () => {
//     console.log('Route params:', route.params);
//     console.log('Attempting to fetch card data for cardId:', cardId);
    
//     setIsLoading(true);
//     try {
//       const data = await tarotApi.getCardDetails(cardId);
//       console.log('Successfully fetched card data:', data);
//       setCardData(data);
//     } catch (error) {
//       console.error('Error in fetchCardData:', error);
//       // 可以在這裡添加錯誤提示UI
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleTurnOver = async () => {
//     // 先獲取卡片數據
//     await fetchCardData();
    
//     // 然後執行翻卡動畫
//     Animated.spring(flipAnim, {
//       toValue: 180,
//       friction: 8,
//       tension: 10,
//       useNativeDriver: true,
//     }).start(() => {
//       setIsFlipped(true);
//     });
//   };

//   const frontAnimatedStyle = {
//     transform: [{ rotateY: frontInterpolate }],
//   };

//   const backAnimatedStyle = {
//     transform: [{ rotateY: backInterpolate }],
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <TouchableOpacity 
//         style={styles.backButton} 
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={styles.backText}>←</Text>
//       </TouchableOpacity>

//       <View style={styles.cardContainer}>
//         <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
//           <Image
//             source={require('../../assets/card-back.png')}
//             style={styles.cardImage}
//             resizeMode="contain"
//           />
//         </Animated.View>

//         <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#FFD700" />
//             </View>
//           ) : cardData ? (
//             <View style={styles.meaningContainer}>
//               <Text style={styles.cardName}>{cardData.name}</Text>
//               <Text style={styles.meaningText}>{cardData.meaning}</Text>
//               <Text style={styles.descriptionText}>
//                 {cardData.description}
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.errorContainer}>
//               <Text style={styles.errorText}>Failed to load card data</Text>
//             </View>
//           )}
//         </Animated.View>
//       </View>

//       {!isFlipped && (
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity 
//             style={styles.turnOverButton}
//             onPress={handleTurnOver}
//           >
//             <Text style={styles.turnOverText}>Turn over</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.abandonButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.abandonText}>Abandon, Choose Again</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//   },
//   backText: {
//     color: 'white',
//     fontSize: 28,
//   },
//   cardContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 100,
//   },
//   cardFace: {
//     width: width * 0.8,
//     height: height * 0.6,
//     borderRadius: 20,
//     position: 'absolute',
//     backfaceVisibility: 'hidden',
//   },
//   cardBack: {
//     backgroundColor: '#1a1a1a',
//     padding: 20,
//     justifyContent: 'center',
//   },
//   cardImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 20,
//   },
//   meaningContainer: {
//     alignItems: 'center',
//     padding: 20,
//   },
//   cardName: {
//     color: '#FFD700',
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   meaningText: {
//     color: '#B8860B',
//     fontSize: 24,
//     marginBottom: 30,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   descriptionText: {
//     color: 'white',
//     fontSize: 18,
//     lineHeight: 28,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//   },
//   turnOverButton: {
//     backgroundColor: '#8B4513',
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 25,
//     marginBottom: 20,
//     width: '80%',
//   },
//   turnOverText: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   abandonButton: {
//     paddingVertical: 10,
//   },
//   abandonText: {
//     color: '#999',
//     fontSize: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: '#FF4444',
//     fontSize: 18,
//     textAlign: 'center',
//   },
// });

// export default CardRevealScreen; 