import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/Auth';

const CaiDat = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', onPress: logout, style: 'destructive' },
    ]);
  };

  const handlePress = () => {
    ToastAndroid.show("Hiện chúng tôi chưa có nền tảng này", ToastAndroid.SHORT);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Tài khoản */}
      <Text style={styles.sectionTitle}>Tài khoản</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Tài khoản')}>
          <Icon name="account-circle" size={24} color="#4a4a4a" />
          <Text style={styles.text}>Thông tin tài khoản</Text>
          <Icon name="chevron-right" size={22} color="#bbb" />
        </TouchableOpacity>
      </View>

      {/* Lịch sử */}
      <Text style={styles.sectionTitle}>Lịch sử</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Lịch sử đặt hàng')}>
          <Icon name="shopping-cart" size={24} color="#4a4a4a" />
          <Text style={styles.text}>Lịch sử đặt hàng</Text>
          <Icon name="chevron-right" size={22} color="#bbb" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Lịch sử hủy')}>
          <Icon name="cancel" size={24} color="#d9534f" />
          <Text style={styles.text}>Lịch sử đơn đã hủy</Text>
          <Icon name="chevron-right" size={22} color="#bbb" />
        </TouchableOpacity>
      </View>

      {/* Kết nối */}
      <Text style={styles.sectionTitle}>Kết nối với chúng tôi</Text>
      <View style={styles.card}>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3b5998' }]} onPress={() => Linking.openURL('https://www.facebook.com/antin86?ref=embed_page')} activeOpacity={0.7}>
            <FontAwesome name="facebook" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#db4437' }]} onPress={() => Linking.openURL('https://bhldantin.com/')} activeOpacity={0.7}>
            <FontAwesome name="google" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#ff3801' }]} onPress={handlePress} activeOpacity={0.7}>
            <FontAwesome name="instagram" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#333' }]} onPress={() => Linking.openURL('https://github.com/Tienphc0512')} activeOpacity={0.7}>
            <FontAwesome name="github" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Về chúng tôi */}
      <Text style={styles.sectionTitle}>Về chúng tôi</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>AnTiiCo</Text>
        <Text style={styles.aboutText}>Phiên bản: 1.0</Text>
        <Text style={styles.aboutText}>Số điện thoại: 0123456789</Text>
        <Text style={styles.aboutText}>Địa chỉ: 123 abc - Phường abc - Thành phố abc</Text>
      </View>

      {/* Đăng xuất */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 12 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    marginTop: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  text: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    padding: 14,
    justifyContent: 'flex-start',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  aboutText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    borderRadius: 25,
    paddingVertical: 14,
    marginTop: 10,
    alignItems: 'center',
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CaiDat;
