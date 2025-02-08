import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const MainScreen = ({ route, navigation }) => {
  const { userData } = route.params || {};

  // Placeholder data for matches and messages
  const matches = [
    { id: 'likes', count: 98, type: 'Likes' },
    { id: '1', name: 'V', verified: true, image: require('../assets/placeholder.png') },
    { id: '2', name: 'Luna', image: require('../assets/placeholder.png') },
    { id: '3', name: 'Donna', image: require('../assets/placeholder.png') },
  ];

  const messages = [
    { 
      id: '1', 
      name: 'Kelly', 
      status: 'LIKES YOU',
      message: 'Recently active, match now!',
      image: require('../assets/placeholder.png'),
      active: true 
    },
    { 
      id: '2', 
      name: 'Ann', 
      verified: true,
      message: 'Hello Ann',
      image: require('../assets/placeholder.png') 
    },
    { 
      id: '3', 
      name: 'R', 
      message: 'Heyyyy',
      label: 'Short-term fun',
      image: require('../assets/placeholder.png'),
      yourTurn: true 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quin</Text>
      </View>

      <ScrollView>
        {/* New Matches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Matches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {matches.map((match) => (
              <TouchableOpacity key={match.id} style={styles.matchCard}>
                {match.type === 'Likes' ? (
                  <View style={styles.likesCard}>
                    <Text style={styles.likesCount}>{match.count}</Text>
                    <Text style={styles.likesText}>Likes</Text>
                  </View>
                ) : (
                  <>
                    <Image source={match.image} style={styles.matchImage} />
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchName}>{match.name}</Text>
                      {match.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Messages</Text>
          {messages.map((message) => (
            <TouchableOpacity key={message.id} style={styles.messageCard}>
              <Image source={message.image} style={styles.messageImage} />
              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageName}>{message.name}</Text>
                  {message.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓</Text>
                    </View>
                  )}
                  {message.status && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{message.status}</Text>
                    </View>
                  )}
                </View>
                {message.label && (
                  <Text style={styles.messageLabel}>In {message.label}</Text>
                )}
                <Text style={styles.messageText}>{message.message}</Text>
              </View>
              {message.yourTurn && (
                <View style={styles.yourTurnBadge}>
                  <Text style={styles.yourTurnText}>Your Turn</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('TarotCards')}
        >
          <Text style={styles.navIcon}>🔥</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('MainScreen')}
        >
          <Text style={styles.navIcon}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.navIcon}>✨</Text>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#FF4458',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  matchCard: {
    width: width * 0.25,
    marginRight: 10,
  },
  matchImage: {
    width: '100%',
    height: width * 0.25,
    borderRadius: 8,
  },
  likesCard: {
    width: '100%',
    height: width * 0.25,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likesCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  likesText: {
    fontSize: 16,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  matchName: {
    color: 'white',
    marginRight: 5,
  },
  messageCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  messageImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  messageContent: {
    flex: 1,
    marginLeft: 15,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  messageLabel: {
    color: '#FF4458',
    fontSize: 12,
  },
  messageText: {
    color: '#666',
    marginTop: 5,
  },
  verifiedBadge: {
    backgroundColor: '#5C5CFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  yourTurnBadge: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'center',
  },
  yourTurnText: {
    color: 'black',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
});

export default MainScreen; 