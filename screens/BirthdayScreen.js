import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Dimensions, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const BirthdayScreen = ({ navigation, route }) => {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedDay, setSelectedDay] = useState('1');
  const [selectedYear, setSelectedYear] = useState('2000');
  const [zodiacSign, setZodiacSign] = useState('');
  const [birthday, setBirthday] = useState(null);
  const { email, password, isGoogleLogin, nickname, bio, gender } = route.params;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) => (2025 - i).toString());

  const zodiacImages = {
    Aries: require('../assets/zodiac/牡羊.webp'),
    Taurus: require('../assets/zodiac/金牛.webp'),
    Gemini: require('../assets/zodiac/雙子.webp'),
    Cancer: require('../assets/zodiac/巨蟹.webp'),
    Leo: require('../assets/zodiac/獅子.webp'),
    Virgo: require('../assets/zodiac/處女.webp'),
    Libra: require('../assets/zodiac/天秤.webp'),
    Scorpio: require('../assets/zodiac/天蠍.webp'),
    Sagittarius: require('../assets/zodiac/射手.webp'),
    Capricorn: require('../assets/zodiac/摩羯.webp'),
    Aquarius: require('../assets/zodiac/水瓶.webp'),
    Pisces: require('../assets/zodiac/雙魚.webp'),
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

  // 更新月份时同时更新生日
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    updateBirthday(month, selectedDay, selectedYear);
  };

  // 更新日期时同时更新生日
  const handleDayChange = (day) => {
    setSelectedDay(day);
    updateBirthday(selectedMonth, day, selectedYear);
  };

  // 更新年份时同时更新生日
  const handleYearChange = (year) => {
    setSelectedYear(year);
    updateBirthday(selectedMonth, selectedDay, year);
  };

  // 更新生日对象
  const updateBirthday = (month, day, year) => {
    const newZodiacSign = getZodiacSign(month, day);
    setZodiacSign(newZodiacSign);
    setBirthday({
      month,
      day,
      year,
      zodiacSign: newZodiacSign
    });
  };

  // 保持星座动画效果
  useEffect(() => {
    const newZodiacSign = getZodiacSign(selectedMonth, selectedDay);
    setZodiacSign(newZodiacSign);
  }, [selectedMonth, selectedDay]);

  // 在组件加载时设置初始生日
  useEffect(() => {
    updateBirthday(selectedMonth, selectedDay, selectedYear);
  }, []);

  const handleContinue = () => {
    if (!birthday) {
      Alert.alert('提示', '請選擇生日');
      return;
    }

    navigation.navigate('ProfilePicture', {
      email,
      password,
      isGoogleLogin,
      nickname,
      bio,
      gender,
      birthday
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
              onValueChange={handleMonthChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {months.map(month => (
                <Picker.Item key={month} label={month} value={month} />
              ))}
            </Picker>

            <Picker
              selectedValue={selectedDay}
              onValueChange={handleDayChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {days.map(day => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>

            <Picker
              selectedValue={selectedYear}
              onValueChange={handleYearChange}
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
    width: 300,
    height: 300,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 180,
  },
  zodiacImage: {
    width: 310,
    height: 310,
    zIndex: 2,
  },
  zodiacGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 180,
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