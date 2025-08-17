import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ToastAndroid,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import Thongtingiaohang from "../Modal/Thongtingiaohang";
import { cancelOrder } from "../../service/api";
import { useAuth } from "../../context/Auth";

export default function DhTopTabs({ orders, refreshing, onRefresh }) {
  const { token } = useAuth();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);

  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const showShippingInfo = (order) => {
    setSelectedOrderInfo({
      username: order.username || "Không xác định",
      sdt: order.sdt || "Chưa có",
      diachi: order.diachi || "Chưa cung cấp",
    });
    setModalVisible(true);
  };

  const handleCancelOrders = () => {
    Alert.alert("Xác nhận", `Bạn có chắc muốn huỷ ${selectedOrders.length} đơn hàng?`, [
      { text: "Không" },
      {
        text: "Có",
        onPress: async () => {
          try {
            for (const id of selectedOrders) {
              await cancelOrder(id, token);
            }
            ToastAndroid.show("Hủy đơn hàng thành công!", ToastAndroid.SHORT);
          } catch (err) {
            ToastAndroid.show("Hủy đơn hàng thất bại.", ToastAndroid.SHORT);
          }
        },
      },
    ]);
  };

    // //chia màu cho tunefg trạng thái đơn hàng
const getStatusColor = (status) => {
  switch (status) {
    case 'choxuly':
      return '#f39c12'; // Vàng
    case 'danggiao':
      return '#3498db'; // Xanh dương
    case 'hoanthanh':
      return '#17944bff'; // Xanh lá
    default:
      return '#7f8c8d'; // Xám
  }
};

  const renderItem = ({ item }) => {
    const isPending = item.trangthai === "choxuly";
    const isSelected = selectedOrders.includes(item.dathang_id);

    return (
      <View style={styles.orderItem}>
        {isPending && (
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={isSelected}
              onValueChange={() => toggleSelectOrder(item.dathang_id)}
              color="#e74c3c"
            />
            <Text style={styles.checkboxLabel}>Chọn để hủy</Text>
          </View>
        )}
        <Text style={styles.orderCode}>Mã đơn: {item.dathang_id}</Text>
        <Text style={styles.infoText}>Sản phẩm: {item.tensanpham}</Text>
        <Text style={styles.infoText}>Số lượng: {item.soluong}</Text>
        <Text style={styles.infoText}>Tổng tiền: {Number(item.tongtien).toLocaleString()}đ</Text>
        <Text>
        Hình thức thanh toán:{' '}
        {item.hinhthuc_thanhtoan === 'cod'
          ? 'Thanh toán khi nhận hàng'
       : item.hinhthuc_thanhtoan}
    </Text>
      <Text style={styles.infoText}>
       Trạng thái:{' '}
         <Text style={{ color: getStatusColor(item.trangthai) }}>
     {item.trangthai === 'choxuly'
       ? 'Chờ xử lý'
      : item.trangthai === 'danggiao'
       ? 'Đang giao'
       : item.trangthai === 'hoanthanh'
      ? 'Đã giao'
      : item.trangthai === 'dahuy'
       ? 'Đã huỷ'
       : 'Không xác định'}
   </Text>
      </Text>
       <Text>Ngày đặt: {new Date(item.ngaydat).toLocaleString()}</Text>
    
        <TouchableOpacity onPress={() => showShippingInfo(item)}>
          <Text style={{ color: "#2980b9", marginTop: 10, fontWeight: "bold" }}>
            Thông tin giao hàng
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.dathang_id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text style={{ textAlign: "center" }}>Không có đơn hàng</Text>}
      />

      {selectedOrders.length > 0 && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrders}>
          <Text style={styles.cancelButtonText}>Hủy {selectedOrders.length} đơn hàng đã chọn</Text>
        </TouchableOpacity>
      )}

      <Thongtingiaohang
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        orderInfo={selectedOrderInfo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orderItem: {
    backgroundColor: "#ecf0f1",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  orderCode: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  infoText: { fontSize: 14, marginBottom: 4 },
  checkboxContainer: { flexDirection: "row",  justifyContent: "flex-end", alignItems: "center", },
  checkboxLabel: { marginLeft: 8 },
  cancelButton: {
    backgroundColor: "#e74c3c",
    padding: 14,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: { color: "#fff", fontWeight: "bold" },
});
