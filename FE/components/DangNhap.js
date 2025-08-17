import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ToastAndroid, Image } from 'react-native';
import { loginUser } from '../service/api';
import { useAuth } from '../context/Auth';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';


export default function DangNhap() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    if (!username || !password) {
      ToastAndroid.show('Vui lòng điền đầy đủ thông tin'), ToastAndroid.SHORT;
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser(username, password);

      // Gọi login để lưu token & userId vào AsyncStorage
      await login(data.token, data.userId);

      // Log token để kiểm tra
      console.log('Đăng nhập thành công. Token:', data.token);


    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại');
      console.error('Lỗi đăng nhập:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePass = () => {
    ToastAndroid.show("Tính năng này sẽ được phát triển sau", ToastAndroid.SHORT);
  }



  return (
    // <ImageBackground
    //   source={require('../assets/antico.png')}
    //   style={styles.background}
    //   resizeMode="container"
    //   imageStyle={{ opacity: 0.7 }}
    // >
    <View style={styles.wrapper}>
      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Image source={require('../assets/logo1.png')} style={styles.logoImage} resizeMode="contain" />
      </View>
      {/* Khung đăng nhập  */}
      <View style={styles.centerwrap}>
        <View style={styles.container}>
          <Text style={styles.title}>Đăng Nhập để tiếp tục</Text>
          <Text style={styles.t1}>Tên đăng nhập</Text>
          <View style={styles.inputWrapper}>
            <FontAwesome name="user" size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Text style={styles.t1}>Mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity onPress={handlePass}>
            <Text style={styles.linkText}>Quên mật khẩu</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginText}>Đăng Nhập</Text>
          </TouchableOpacity>


        </View>
      </View>
      <View style={styles.socialContainer}>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3b5998' }]}
          onPress={handlePass}>
          <FontAwesome name="facebook" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#db4437' }]}
          onPress={handlePass}>
          <FontAwesome name="google" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#0072c6' }]}
          onPress={handlePass}>
          <FontAwesome name="envelope" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Đăng ký ở cuối */}
      <View style={styles.bottomwrap}>
        <Text style={styles.Text1}>
          Bạn chưa có tài khoản?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Đăng ký')} >
          <Text style={styles.linkText}>Tạo tài khoản</Text>
        </TouchableOpacity>
      </View>
    </View>
    // </ImageBackground>
  );

};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingVertical: 30,
    backgroundColor: '#eaf4f4', // xanh mint nhạt

  },

  logoImage: {
    width: 210,
    height: 150,
  },

  centerwrap: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
  },

  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },

  t1: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 5,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#068ea9ff',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 15,
    
  },

  inputIcon: {
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    color: '#222',
  },

  linkText: {
    color: '#0c5ab9ff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },

  loginText: {
    backgroundColor: '#0e9046',
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 15,
  },

  bottomwrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },

  Text1: {
    color: '#222',
    fontSize: 14,
    marginRight: 5,
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
});
