import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { fetchDiaChi, updateDiaChi, deleteDiaChi, addDiaChi } from '../../service/api';
import { useAuth } from '../../context/Auth';
import { Ionicons } from '@expo/vector-icons';

export default function DiaChiModal({ visible, onClose }) {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newDiaChi, setNewDiaChi] = useState('');

  const loadDiaChi = async () => {
    setLoading(true);
    try {
      const data = await fetchDiaChi(token);
      setList(data);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { if (visible) loadDiaChi(); }, [visible]);

  const handleUpdate = async (index) => {
    try {
      await updateDiaChi(list[index].id, { diachi: list[index].diachi, macdinh: list[index].macdinh }, token);
      ToastAndroid.show('Cập nhật địa chỉ thành công', ToastAndroid.SHORT);
      setEditIndex(null);
      loadDiaChi();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiaChi(id, token);
      loadDiaChi();
      ToastAndroid.show('Xóa địa chỉ thành công', ToastAndroid.SHORT);
    } catch (err) { alert(err.message); }
  };

  const handleAdd = async () => {
    if (!newDiaChi.trim()) return alert('Vui lòng nhập địa chỉ');
    try {
      await addDiaChi({ diachi: newDiaChi, macdinh: false }, token);
      setNewDiaChi('');
      loadDiaChi();
      ToastAndroid.show('Thêm địa chỉ thành công', ToastAndroid.SHORT);
    } catch (err) { alert(err.message); }
  };

  const handleInputChange = (index, key, value) => {
    const updatedList = [...list];
    updatedList[index][key] = value;
    setList(updatedList);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Quản lý địa chỉ</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#4A6FA5" />
            </TouchableOpacity>
          </View>

          {/* Input thêm địa chỉ */}
          <View style={styles.newCard}>
            <TextInput
              value={newDiaChi}
              onChangeText={setNewDiaChi}
              placeholder="Nhập địa chỉ mới"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
              <Text style={styles.btnText}>Thêm địa chỉ</Text>
            </TouchableOpacity>
          </View>

          {/* Danh sách địa chỉ */}
          <ScrollView style={{ maxHeight: 300 }}>
            {loading ? <Text>Đang tải...</Text> :
              list.map((item, index) => (
                <View key={item.id} style={styles.card}>
                  {editIndex === index ? (
                    <>
                      <TextInput
                        value={item.diachi}
                        onChangeText={text => handleInputChange(index, 'diachi', text)}
                        style={styles.input}
                      />
                      <View style={styles.radioRow}>
                        <TouchableOpacity
                          style={[styles.radioOption, item.macdinh && styles.radioSelected]}
                          onPress={() => handleInputChange(index, 'macdinh', true)}
                        >
                          <Text style={[styles.radioText, item.macdinh && styles.radioTextSelected]}>Địa chỉ chính</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.radioOption, !item.macdinh && styles.radioSelected]}
                          onPress={() => handleInputChange(index, 'macdinh', false)}
                        >
                          <Text style={[styles.radioText, !item.macdinh && styles.radioTextSelected]}>Địa chỉ phụ</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => handleUpdate(index)} style={styles.saveBtn}>
                        <Text style={styles.btnText}>Lưu</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Địa chỉ:</Text> {item.diachi}</Text>
                      <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Loại địa chỉ:</Text> {item.macdinh ? 'Chính' : 'Phụ'}</Text>
                      <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={() => setEditIndex(index)} style={styles.editBtn}>
                          <Text style={styles.btnText}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                          <Text style={styles.btnText}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))
            }
          </ScrollView>

          {/* Button Đóng
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 15 },
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  newCard: { padding: 10, backgroundColor: '#e7f3ff', borderRadius: 10, marginBottom: 10 },
  card: { padding: 12, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
  editBtn: { backgroundColor: '#007bff', padding: 8, borderRadius: 5, marginRight: 10 },
  deleteBtn: { backgroundColor: '#dc3545', padding: 8, borderRadius: 5 },
  saveBtn: { backgroundColor: '#28a745', padding: 8, borderRadius: 5, marginTop: 5 },
  addBtn: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginTop: 5, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  radioRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  radioOption: { flex: 1, padding: 10, marginHorizontal: 5, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  radioSelected: { backgroundColor: '#4A6FA5', borderColor: '#4A6FA5' },
  radioText: { fontWeight: 'bold', color: '#000' },
  radioTextSelected: { color: '#fff' },
  closeBtn: { backgroundColor: '#6c757d', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
});
