import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserProfileScreen = ({ route, navigation }) => {
  const { userData } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 頭部照片區域 */}
        <View style={styles.header}>
          <Image 
            source={{ uri:userData.image}} 
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 用戶信息區域 */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {userData.name}, {userData.age}
            {userData.verified && (
              <Ionicons name="checkmark-circle" size={20} color="#5C5CFF" />
            )}
          </Text>

          {/* 基本信息 */}
          {/* <View style={styles.basicInfo}>
            <Text style={styles.infoText}>
              <Ionicons name="location" size={16} color="#666" /> {userData.location || '未設置地點'}
            </Text>
            <Text style={styles.infoText}>
              <Ionicons name="school" size={16} color="#666" /> {userData.education || '未設置教育程度'}
            </Text>
            <Text style={styles.infoText}>
              <Ionicons name="briefcase" size={16} color="#666" /> {userData.occupation || '未設置職業'}
            </Text>
          </View> */}

          {/* 興趣標籤 */}
          <View style={styles.interestsContainer}>
            <Text style={styles.sectionTitle}>興趣</Text>
            <View style={styles.interestTags}>
              {userData.interests?.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 關於我 */}
          <View style={styles.aboutContainer}>
            <Text style={styles.sectionTitle}>關於我</Text>
            <Text style={styles.aboutText}>
              {userData.about || '這個用戶還沒有填寫介紹。'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 400,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  basicInfo: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  interestsContainer: {
    marginBottom: 20,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
  },
  aboutContainer: {
    marginBottom: 20,
  },
  aboutText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
});

export default UserProfileScreen; 