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
  const [expandedOrders, setExpandedOrders] = useState([]);

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

  const groupedOrders = orders.reduce((acc, item) => {
    const existing = acc.find(o => o.dathang_id === item.dathang_id);
    if (existing) {
      existing.sanpham.push({
        tensanpham: item.tensanpham,
        soluong: item.soluong,
        dongia: item.dongia,
        tongtien: item.tongtien,
      });
    } else {
      acc.push({
        dathang_id: item.dathang_id,
        username: item.username,
        sdt: item.sdt,
        diachi: item.diachi,
        trangthai: item.trangthai,
        hinhthuc_thanhtoan: item.hinhthuc_thanhtoan,
        ngaydat: item.ngaydat,
        sanpham: [{
          tensanpham: item.tensanpham,
          soluong: item.soluong,
          dongia: item.dongia,
          tongtien: item.tongtien,
        }],
      });
    }
    return acc;
  }, []);

  const toggleExpand = (dathang_id) => {
    setExpandedOrders(prev =>
      prev.includes(dathang_id)
        ? prev.filter(id => id !== dathang_id)
        : [...prev, dathang_id]
    );
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedOrders.includes(item.dathang_id);
    const isPending = item.trangthai === "choxuly";
    const isSelected = selectedOrders.includes(item.dathang_id);

    return (
      <View style={styles.orderItem}>
        {/* Hàng đầu: mã đơn + trạng thái */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.orderCode}>Mã đơn: {item.dathang_id}</Text>
         <View
  style={[styles.statusBadge, { backgroundColor: getStatusColor(item.trangthai) }]}
>
  <Text style={{ color: '#fff', fontWeight: '600' }}>
    {item.trangthai === "choxuly"
      ? "Chờ xử lý"
      : item.trangthai === "danggiao"
        ? "Đang giao"
        : item.trangthai === "hoanthanh"
          ? "Đã giao"
          : item.trangthai === "dahuy"
            ? "Đã huỷ"
            : "Không xác định"}
  </Text>
</View>

        </View>

        {/* Checkbox hủy nếu chờ xử lý */}
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

        {/* Danh sách sản phẩm */}
        <View style={{ marginTop: 6 }}>
          {item.sanpham.length === 1 ? (
            <View>
              <Text style={styles.productName}>{item.sanpham[0].tensanpham}</Text>
              <Text style={styles.infoText}>Số lượng: {item.sanpham[0].soluong}</Text>
              <Text style={styles.priceText}>
                Đơn giá: {Number(item.sanpham[0].dongia).toLocaleString()}đ
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.productName}>{item.sanpham[0].tensanpham}</Text>
              <Text style={styles.infoText}>Số lượng: {item.sanpham[0].soluong}</Text>
              <Text style={styles.priceText}>
                Đơn giá: {Number(item.sanpham[0].dongia).toLocaleString()}đ
              </Text>

              {!isExpanded && (
                <Text style={{ color: "#7f8c8d" }}>
                  ...và {item.sanpham.length - 1} sản phẩm khác
                </Text>
              )}

              {isExpanded &&
                item.sanpham.slice(1).map((sp, idx) => (
                  <View key={idx + 1} style={{ marginTop: 4 }}>
                    <Text style={styles.productName}>{sp.tensanpham}</Text>
                    <Text style={styles.infoText}>Số lượng: {sp.soluong}</Text>
                    <Text style={styles.priceText}>
                      Đơn giá: {Number(sp.dongia).toLocaleString()}đ
                    </Text>
                  </View>
                ))}

              <TouchableOpacity onPress={() => toggleExpand(item.dathang_id)}>
                <Text
                  style={{
                    color: "#2980b9",
                    marginTop: 4,
                    textDecorationLine: "underline",
                  }}
                >
                  {isExpanded ? "Thu gọn" : "Xem thêm"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Hình thức thanh toán + Ngày đặt */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <Text style={styles.infoText}>
            {item.hinhthuc_thanhtoan === "cod"
              ? "Thanh toán khi nhận hàng"
              : item.hinhthuc_thanhtoan}
          </Text>
          <Text style={styles.infoText}>{new Date(item.ngaydat).toLocaleString()}</Text>
        </View>

        {/* Tổng tiền */}
        <Text style={styles.totalText}>
          Tổng: {Number(item.sanpham[0].tongtien).toLocaleString()}đ
        </Text>

        {/* Thông tin giao hàng */}
        <TouchableOpacity onPress={() => showShippingInfo(item)}>
          <Text style={styles.shippingLink}>Thông tin giao hàng</Text>
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={groupedOrders}
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
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderCode: { fontWeight: "bold", fontSize: 16, color: "#2c3e50" },
  infoText: { fontSize: 13, color: "#555" },
  productName: { fontWeight: "600", fontSize: 14, color: "#34495e" },
  priceText: { fontSize: 13, fontWeight: "500", color: "#27ae60" },
  totalText: { fontSize: 15, fontWeight: "700", color: "#27ae60", marginTop: 8 },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  checkboxLabel: { marginLeft: 8, color: "#7f8c8d" },
  shippingLink: {
    color: "#2980b9",
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "right",
  },
  cancelButton: {
  backgroundColor: "#e74c3c",
  padding: 12,
  borderRadius: 8,
  margin: 16,
  alignItems: "center",
},
cancelButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},

});
