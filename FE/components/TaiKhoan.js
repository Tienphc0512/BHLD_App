import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { fetchTaiKhoan, updateTaiKhoan } from '../service/api';
import { useAuth } from '../context/Auth';
import DiaChiModal from './Modal/DiaChiModal';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const TaiKhoan = () => {
  const [formData, setFormData] = useState({ username: '', hoten: '', sdt: '', email: '', matkhau: '' });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { token } = useAuth();
  const [showDiaChiModal, setShowDiaChiModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const getTaiKhoan = async () => {
        setLoading(true);
        try {
          const data = await fetchTaiKhoan(token);
          setFormData(data);
        } catch (err) {
          console.log(err.message);
        }
        setLoading(false);
      };
      getTaiKhoan();
    }, [token])
  );

  const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    setUpdating(true);
    try {
      await updateTaiKhoan(formData, token);
      ToastAndroid.show('Cập nhật tài khoản thành công', ToastAndroid.SHORT);
    } catch (err) {
      console.log(err.message);
    }
    setUpdating(false);
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  const fields = [
    { label: 'Tên đăng nhập', key: 'username', secure: false, keyboard: 'default', icon: 'person-outline' },
    { label: 'Họ tên', key: 'hoten', secure: false, keyboard: 'default', icon: 'person-circle-outline' },
    { label: 'Số điện thoại', key: 'sdt', secure: false, keyboard: 'phone-pad', icon: 'call-outline' },
    { label: 'Email', key: 'email', secure: false, keyboard: 'email-address', icon: 'mail-outline' },
    { label: 'Mật khẩu', key: 'matkhau', secure: true, keyboard: 'default', icon: 'lock-closed-outline' },
  ];

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#4A6FA5" />
          <Text style={styles.header}>Thông tin tài khoản</Text>
        </View>

        {fields.map(field => (
          <View key={field.key} style={styles.card}>
            <View style={styles.inputRow}>
              <Ionicons name={field.icon} size={20} color="#4A6FA5" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder={field.label}
                value={formData[field.key]}
                onChangeText={text => handleChange(field.key, text)}
                secureTextEntry={field.secure}
                keyboardType={field.keyboard}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.card} onPress={() => setShowDiaChiModal(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600', color: '#555' }}>Địa chỉ</Text>
            <Ionicons name="chevron-forward" size={24} color="#4A6FA5" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.updateBtn} onPress={onSubmit} disabled={updating}>
          <Text style={styles.updateBtnText}>{updating ? 'Đang cập nhật...' : 'Cập nhật tài khoản'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <DiaChiModal visible={showDiaChiModal} onClose={() => setShowDiaChiModal(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5', paddingBottom: 50 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginTop: 10, color: '#333' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 16, color: '#222', paddingVertical: 6 },
  updateBtn: {
    backgroundColor: '#4A6FA5',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  updateBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default TaiKhoan;
