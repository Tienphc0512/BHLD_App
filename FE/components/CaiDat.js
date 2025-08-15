import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/Auth';

const CaiDat = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();


  const handleLogout = () => {
    logout();
  };
  const handlePress = () => {
    ToastAndroid.show("Hiện chúng tôi chưa có nền tảng này", ToastAndroid.SHORT);
  };
  return (
    <ScrollView style={styles.container}>
      {/* Nhóm: Tài khoản */}
      <Text style={styles.sectionTitle}>Tài khoản</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Tài khoản')}>
          <Icon name="account-circle" size={24} color="#4a4a4a" />
          <Text style={styles.text}>Thông tin tài khoản</Text>
          <Icon name="chevron-right" size={22} color="#bbb" />
        </TouchableOpacity>
      </View>

      {/* Nhóm: Lịch sử */}
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

      {/* Nhóm: Kết nối */}
      <Text style={styles.sectionTitle}>Kết nối với chúng tôi</Text>
      <View style={styles.card}>
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#3b5998' }]}
            onPress={() => Linking.openURL('https://www.facebook.com/antin86?ref=embed_page')}
          >
            <FontAwesome name="facebook" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#db4437' }]}
            onPress={() => Linking.openURL('https://bhldantin.com/')}
          >
            <FontAwesome name="google" size={22} color="#fff" />
          </TouchableOpacity>

           <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#ff3801ff' }]}
            onPress={handlePress}
          >
            <FontAwesome name="instagram" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#333' }]}
            onPress={() => Linking.openURL('https://github.com/Tienphc0512')}
          >
            <FontAwesome name="github" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

       {/* Về chúng tôi */}
      <Text style={styles.sectionTitle}>Về chúng tôi</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.modalText}>
          Đây là ứng dụng của AnTiiCo nhằm mang đến trải nghiệm mua sắm với những món đồ Bảo Hộ Lao Động dễ dàng và nhanh chóng cũng như đảm bảo an toàn đến mọi người.
        </Text>
        <Text style={styles.modalText}>Phiên bản: 1.0</Text>
        <Text style={styles.modalContact}>Số điện thoại: 0123456789</Text>
  <Text style={styles.modalContact}>Địa chỉ: 123 abc - Phường abc - Thành phố abc</Text>
      </View>

      {/* Nút đăng xuất */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f5', padding: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 6,
    marginTop: 14,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.6,
    borderBottomColor: '#f0f0f0',
  },
  text: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    padding: 14,
    justifyContent: 'flex-start',
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    borderRadius: 25,
    paddingVertical: 14,
    marginTop: 14,
    alignItems: 'center',
    elevation: 2,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalContact: {
  fontSize: 13,
  color: '#777',
  marginTop: 2,
},
});

export default CaiDat;
