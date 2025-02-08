import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const BirthdayScreen = ({ navigation, route }) => {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedDay, setSelectedDay] = useState('1');
  const [selectedYear, setSelectedYear] = useState('2000');
  const [zodiacSign, setZodiacSign] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) => (2025 - i).toString());

  const zodiacImages = {
    // Aries: require('../assets/zodiac/aries.png'),
    // Taurus: require('../assets/zodiac/taurus.png'),
    // Gemini: require('../assets/zodiac/gemini.png'),
    // Cancer: require('../assets/zodiac/cancer.png'),
    // Leo: require('../assets/zodiac/leo.png'),
    // Virgo: require('../assets/zodiac/virgo.png'),
    // Libra: require('../assets/zodiac/libra.png'),
    // Scorpio: require('../assets/zodiac/scorpio.png'),
    // Sagittarius: require('../assets/zodiac/sagittarius.png'),
    // Capricorn: require('../assets/zodiac/capricorn.png'),
    // Aquarius: require('../assets/zodiac/aquarius.png'),
    // Pisces: require('../assets/zodiac/pisces.png'),
    Aries: require('../assets/zodiac/Aquarius.jpeg'),
    Taurus: require('../assets/zodiac/Aquarius.jpeg'),
    Gemini: require('../assets/zodiac/Aquarius.jpeg'),
    Cancer: require('../assets/zodiac/Aquarius.jpeg'),
    Leo: require('../assets/zodiac/Aquarius.jpeg'),
    Virgo: require('../assets/zodiac/Aquarius.jpeg'),
    Libra: require('../assets/zodiac/Aquarius.jpeg'),
    Scorpio: require('../assets/zodiac/Aquarius.jpeg'),
    Sagittarius: require('../assets/zodiac/Aquarius.jpeg'),
    Capricorn: require('../assets/zodiac/Aquarius.jpeg'),
    Aquarius: require('../assets/zodiac/Aquarius.jpeg'),
    Pisces: require('../assets/zodiac/Aquarius.jpeg'),
  };

  const getZodiacSign = (month, day) => {
    const monthIndex = months.indexOf(month);
    const date = parseInt(day);
    
    if ((monthIndex === 0 && date >= 20) || (monthIndex === 1 && date <= 18)) {
      return 'Aquarius';
    } else if ((monthIndex === 1 && date >= 19) || (monthIndex === 2 && date <= 20)) {
      return 'Pisces';
    } else if ((monthIndex === 2 && date >= 21) || (monthIndex === 3 && date <= 19)) {
      return 'Aries';
    } else if ((monthIndex === 3 && date >= 20) || (monthIndex === 4 && date <= 20)) {
      return 'Taurus';
    } else if ((monthIndex === 4 && date >= 21) || (monthIndex === 5 && date <= 20)) {
      return 'Gemini';
    } else if ((monthIndex === 5 && date >= 21) || (monthIndex === 6 && date <= 22)) {
      return 'Cancer';
    } else if ((monthIndex === 6 && date >= 23) || (monthIndex === 7 && date <= 22)) {
      return 'Leo';
    } else if ((monthIndex === 7 && date >= 23) || (monthIndex === 8 && date <= 22)) {
      return 'Virgo';
    } else if ((monthIndex === 8 && date >= 23) || (monthIndex === 9 && date <= 22)) {
      return 'Libra';
    } else if ((monthIndex === 9 && date >= 23) || (monthIndex === 10 && date <= 21)) {
      return 'Scorpio';
    } else if ((monthIndex === 10 && date >= 22) || (monthIndex === 11 && date <= 21)) {
      return 'Sagittarius';
    } else {
      return 'Capricorn';
    }
  };

  useEffect(() => {
    const newZodiacSign = getZodiacSign(selectedMonth, selectedDay);
    setZodiacSign(newZodiacSign);
  }, [selectedMonth, selectedDay]);

  const handleContinue = () => {
    // Create a date string from the selected values
    const selectedDate = {
      month: selectedMonth,
      day: selectedDay,
      year: selectedYear,
      zodiacSign: zodiacSign
    };

    navigation.navigate('ProfilePicture', {
      ...route.params,
      birthday: selectedDate
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your birthday</Text>

        <View style={styles.zodiacContainer}>
          <View style={styles.zodiacImageWrapper}>
            <Image
              source={zodiacImages[zodiacSign]}
              style={styles.zodiacImage}
              resizeMode="contain"
            />
            <View style={styles.zodiacGlow} />
          </View>
          <Text style={styles.zodiacText}>{zodiacSign}</Text>
        </View>

        <View style={styles.pickerWrapper}>
          <View style={styles.pickerHighlight} />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={setSelectedMonth}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {months.map(month => (
                <Picker.Item key={month} label={month} value={month} />
              ))}
            </Picker>

            <Picker
              selectedValue={selectedDay}
              onValueChange={setSelectedDay}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {days.map(day => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>

            <Picker
              selectedValue={selectedYear}
              onValueChange={setSelectedYear}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {years.map(year => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>→</Text>
          </TouchableOpacity>
        </View>
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
  },
  title: {
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
    fontWeight: 'bold',
  },
  zodiacContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  zodiacImageWrapper: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacImage: {
    width: 80,
    height: 80,
  },
  zodiacGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: 'rgba(92, 92, 255, 0.2)',
    transform: [{ scale: 1.2 }],
  },
  zodiacText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  pickerWrapper: {
    position: 'relative',
  },
  pickerHighlight: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 50,
    transform: [{ translateY: -20 }],
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    zIndex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    zIndex: 2,
  },
  picker: {
    flex: 1,
    color: 'white',
  },
  pickerItem: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 18,
  },
  continueButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5C5CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 24,
  },
});

export default BirthdayScreen; 