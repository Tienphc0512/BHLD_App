import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  ToastAndroid
} from 'react-native';
import { placeOrder, fetchOrderDetails, fetchTaiKhoan, updateTaiKhoan, fetchDiaChi } from '../../service/api';
import { useAuth } from '../../context/Auth';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '@react-navigation/native';

export default function DatHang({ route }) {
  const [orderDetails, setOrderDetails] = useState({
    items: [],
    tongtien: 0,
    diaChi: '',
  });

  const { token } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', sdt: '' });
  const [showModal, setShowModal] = useState(false);
  const { sp: selectedItem } = route.params ?? {}; // nếu từ 1 sản phẩm cụ thể
  const { selectedProducts } = route.params ?? {}; // nếu từ giỏ hàng
  const [diaChiList, setDiaChiList] = useState([]);
  const [selectedDiaChiId, setSelectedDiaChiId] = useState(null);
  const navigation = useNavigation();
  const { clearCartAfterPurchase } = useCart();

  const fetchInfoAndInitOrder = async () => {
    setLoading(true);
    try {
      const data = await fetchTaiKhoan(token);
      const diachiData = await fetchDiaChi(token);

      setUserInfo({
        username: data.username,
        sdt: data.sdt,
      });

      setDiaChiList(diachiData || []);
      const defaultDiaChi = diachiData.find((dc) => dc.macdinh) || diachiData[0];

      if (selectedProducts && selectedProducts.length > 0) {
        const items = selectedProducts.map((item) => ({
          sanpham_id: item.id,
          soluong: item.soluong || 1,
          dongia: item.gia,
          tonKho: item.tonKho,
        }));

        const tongtien = items.reduce((sum, item) => sum + item.soluong * item.dongia, 0);

        setOrderDetails({
          items,
          tongtien,
          diaChi: defaultDiaChi?.diachi || '',
        });
        setSelectedDiaChiId(defaultDiaChi?.id ?? null);
      }

      if (selectedItem && !isNaN(selectedItem.soluong)) {
        setOrderDetails({
          items: [{
            sanpham_id: selectedItem.id,
            soluong: 1,
            dongia: selectedItem.gia,
            tonKho: selectedItem.soluong
          }],
          tongtien: selectedItem.gia,
          diaChi: defaultDiaChi?.diachi || '',
        });
        setSelectedDiaChiId(defaultDiaChi?.id ?? null);
      }
    } catch (err) {
      setMessage("Không thể tải thông tin tài khoản hoặc địa chỉ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInfoAndInitOrder();
  }, [selectedItem]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setMessage('');

    if (selectedProducts && selectedProducts.length > 0) {
      for (let i = 0; i < selectedProducts.length; i++) {
        const cartItem = selectedProducts[i];
        const orderItem = orderDetails.items[i];
        if (orderItem.soluong > cartItem.tonKho) {
          setMessage(`Sản phẩm "${cartItem.ten_san_pham}" vượt quá tồn kho!`);
          setLoading(false);
          return;
        }
      }
    }

    if (selectedItem && orderDetails.items[0].soluong > selectedItem.soluong) {
      setMessage('Số lượng vượt quá tồn kho!');
      setLoading(false);
      return;
    }

    try {
      const data = await placeOrder(
        { ...orderDetails, diachi_id: selectedDiaChiId },
        token
      );
      const newOrderId = data.dathang_id;
      setOrderId(newOrderId);
      setMessage(`Đặt hàng thành công! Mã đơn hàng: ${newOrderId}`);

      if (selectedProducts && selectedProducts.length > 0) {
        clearCartAfterPurchase(selectedProducts);
      }

      try {
        const details = await fetchOrderDetails(newOrderId, token);
        setOrderInfo(details);
      } catch {
        Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng.");
      }

    } catch (err) {
      setMessage(err.message || "Lỗi không xác định");
    }
    setLoading(false);
  };

  const handleFetchOrderDetailsWithId = () => {
    navigation.navigate("Đơn hàng", { orderDetails: {} });
    setLoading(true);
    setMessage('');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const currentData = await fetchTaiKhoan(token);
      await updateTaiKhoan({
        username: userInfo.username,
        sdt: userInfo.sdt,
        hoten: userInfo.hoten ?? currentData.hoten,
        email: userInfo.email ?? currentData.email,
      }, token);

      const refreshed = await fetchTaiKhoan(token);
      setUserInfo({
        username: refreshed.username,
        sdt: refreshed.sdt,
      });

      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      setShowModal(false);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchInfoAndInitOrder} />
        }
      >
        {/* Thông tin người nhận */}
        <View style={styles.sectionBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <Text style={{ color: 'blue' }}>Thay đổi</Text>
            </TouchableOpacity>
          </View>
          <Text>Họ tên: {userInfo.username}</Text>
          <Text>SĐT: {userInfo.sdt}</Text>
          <Text>Địa chỉ: {orderDetails.diaChi}</Text>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          {(selectedProducts || [selectedItem]).filter(Boolean).map((item, index) => (
            <View key={item.id || index} style={styles.productCard}>
              <Image source={{ uri: item.anh_dai_dien }} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.ten_san_pham}</Text>
                <Text>{Number(item.gia).toLocaleString()}đ</Text>

                {/* tăng giảm số lượng */}
                {orderDetails.items[index] && (
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      onPress={() => {
                        const newItems = [...orderDetails.items];
                        if (newItems[index].soluong > 1) {
                          newItems[index].soluong -= 1;
                          const tongtien = newItems.reduce((s, i) => s + i.soluong * i.dongia, 0);
                          setOrderDetails({ ...orderDetails, items: newItems, tongtien });
                        }
                      }}
                      style={styles.qtyButton}
                    >
                      <Text style={styles.qtyText}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 10 }}>
                      {orderDetails.items[index]?.soluong ?? 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        const newItems = [...orderDetails.items];
                        if (newItems[index].soluong < newItems[index].tonKho) {
                          newItems[index].soluong += 1;
                          const tongtien = newItems.reduce((s, i) => s + i.soluong * i.dongia, 0);
                          setOrderDetails({ ...orderDetails, items: newItems, tongtien });
                        } else {
                          ToastAndroid.show("Số lượng vượt quá tồn kho!", ToastAndroid.SHORT);
                        }
                      }}
                      style={styles.qtyButton}
                    >
                      <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Tổng hợp đơn hàng */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Tổng hợp</Text>
          <View style={styles.rowBetween}>
            <Text>Tạm tính</Text>
            <Text>{Number(orderDetails.tongtien).toLocaleString()}đ</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text>Phí vận chuyển</Text>
            <Text>0đ</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text>Giảm giá</Text>
            <Text>0đ</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Tổng cộng</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'red' }}>
              {Number(orderDetails.tongtien).toLocaleString()}đ
            </Text>
          </View>
        </View>

        {orderId !== '' && (
          <TouchableOpacity
            onPress={() => handleFetchOrderDetailsWithId(orderInfo)}
            style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 5 }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Theo dõi đơn hàng</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Thanh đặt hàng dưới cùng */}
      <View style={styles.bottomBar}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
          {Number(orderDetails.tongtien).toLocaleString()}đ
        </Text>
        <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Modal chỉnh sửa thông tin khách hàng */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Chỉnh sửa thông tin</Text>
            <TextInput
              value={userInfo.username}
              onChangeText={(text) => setUserInfo({ ...userInfo, username: text })}
              placeholder="Tên đăng nhập"
              style={styles.input}
            />
            <TextInput
              value={userInfo.sdt}
              onChangeText={(text) => setUserInfo({ ...userInfo, sdt: text })}
              placeholder="Số điện thoại"
              style={styles.input}
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={{ color: '#fff' }}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#fff' }}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2
  },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  productCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8
  },
  productImage: { width: 70, height: 70, borderRadius: 6, marginRight: 10 },
  productName: { fontSize: 15, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  qtyButton: { backgroundColor: '#ddd', paddingHorizontal: 10, borderRadius: 5 },
  qtyText: { fontSize: 18, fontWeight: 'bold' },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  orderButton: { backgroundColor: 'green', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 10, borderRadius: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveBtn: { backgroundColor: 'green', padding: 10, borderRadius: 5 },
  cancelBtn: { backgroundColor: 'gray', padding: 10, borderRadius: 5 }
});
