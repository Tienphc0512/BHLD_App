import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../service/api';
import { FontAwesome } from '@expo/vector-icons';

export default function DangKy() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullname, setFullname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !phone || !password || !email || !fullname) {
      ToastAndroid.show('Vui lòng điền đầy đủ thông tin', ToastAndroid.SHORT);
      return;
    }
    try {
      await registerUser(username, password, email, phone, fullname);
      ToastAndroid.show('Đăng ký thành công!', ToastAndroid.SHORT);
      navigation.navigate('Đăng nhập');
    } catch (error) {
      setError(error.response?.data?.message || 'Đăng ký thất bại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    ToastAndroid.show('Tính năng này sẽ được phát triển sau', ToastAndroid.SHORT);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Image source={require('../assets/logo1.png')} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Form */}
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Tạo tài khoản</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} style={styles.icon} />
          <TextInput
            placeholder="Tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="#052c5fff"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Họ và tên"
            value={fullname}
            onChangeText={setFullname}
            style={styles.input}
            placeholderTextColor="#052c5fff"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Số điện thoại"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={setPhone}
            style={styles.input}
            placeholderTextColor="#052c5fff"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#052c5fff"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor="#052c5fff"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>

      {/* Social buttons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3b5998' }]} onPress={handlePress}>
          <FontAwesome name="facebook" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#db4437' }]} onPress={handlePress}>
          <FontAwesome name="google" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf4f4',// vàng pastel
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  formWrapper: {
     width: '100%',
     backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#632e08ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#068ea9ff',
  },
  icon: {
    marginRight: 8,
    color: '#068ea9ff',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#0e9046',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  logoImage: {
    width: 210,
    height: 150,
  },
});
