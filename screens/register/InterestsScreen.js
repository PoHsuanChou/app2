import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InterestsScreen = ({ navigation, route }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const registrationData = route.params;
  
  const interests = [
    '塔羅牌', '占星術', '冥想', '瑜伽',
    '靈性成長', '心理學', '自我提升',
    '藝術', '音樂', '旅行', '美食',
    '運動', '攝影', '閱讀', '寫作',
    '電影', '戶外活動', '寵物'
  ];

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleContinue = () => {
    if (selectedInterests.length < 3) {
      Alert.alert('提示', '請至少選擇3個興趣');
      return;
    }

    navigation.navigate('TarotDeck', {
      ...registrationData,
      interests: selectedInterests
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>選擇興趣</Text>
        <Text style={styles.subtitle}>選擇1-5個你感興趣的話題</Text>
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {selectedInterests.length}/5
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.interestsGrid}>
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                selectedInterests.includes(interest) && styles.selectedInterest
              ]}
              onPress={() => toggleInterest(interest)}
              disabled={!selectedInterests.includes(interest) && selectedInterests.length >= 5}
            >
              <Text style={[
                styles.interestText,
                selectedInterests.includes(interest) && styles.selectedInterestText
              ]}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.button,
          selectedInterests.length === 0 && styles.buttonDisabled
        ]}
        onPress={handleContinue}
        disabled={selectedInterests.length === 0}
      >
        <Text style={styles.buttonText}>下一步</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
    marginBottom: 16,
  },
  counter: {
    backgroundColor: '#111',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    color: '#f4511e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  interestButton: {
    width: '48%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  selectedInterest: {
    backgroundColor: '#f4511e',
    borderColor: '#f4511e',
  },
  interestText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedInterestText: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#f4511e',
    margin: 24,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#f4511e",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#333',
    shadowColor: "#000",
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default InterestsScreen; 