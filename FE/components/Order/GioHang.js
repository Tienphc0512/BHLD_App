import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  RefreshControl,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { removeFromCart as removeFromCartAPI } from "../../service/api";
import { useAuth } from "../../context/Auth";
import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";

const GioHang = () => {
  const { cartItems, removeFromCart, loadCartFromStorage } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { token } = useAuth();
  const navigation = useNavigation();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCartFromStorage();
    } catch (error) {
      console.error("Lỗi khi refresh giỏ hàng:", error);
    }
    setRefreshing(false);
  };

  const toggleSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      ToastAndroid.show(
        "Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng.",
        ToastAndroid.SHORT
      );
      return;
    }

    const selectedProducts = cartItems
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => ({
        ...item,
      }));

    navigation.navigate("Đặt hàng", { selectedProducts, token });
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Checkbox
        value={selectedItems.includes(item.id)}
        onValueChange={() => toggleSelect(item.id)}
        style={styles.checkbox}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>
          {item.ten} {item.ten_san_pham}
        </Text>
        <Text>Số lượng: {item.soluong}</Text>
        <Text>Giá: {parseInt(item.gia).toLocaleString()} VNĐ</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giỏ hàng của bạn</Text>
      {cartItems.length === 0 ? (
        <Text>Chưa có sản phẩm nào trong giỏ hàng.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <View style={styles.selectAllContainer}>
                <Checkbox
                  value={selectedItems.length === cartItems.length}
                  onValueChange={() => {
                    if (selectedItems.length === cartItems.length) {
                      setSelectedItems([]);
                    } else {
                      setSelectedItems(cartItems.map((item) => item.id));
                    }
                  }}
                />
                <Text style={{ marginLeft: 8 }}>Chọn tất cả</Text>
              </View>
            }
          />

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.deleteBtn, { flex: 1, marginRight: 8 }]}
              onPress={async () => {
                if (selectedItems.length === 0) {
                  ToastAndroid.show(
                    "Vui lòng chọn ít nhất 1 sản phẩm để xoá.",
                    ToastAndroid.SHORT
                  );

                  return;
                }

                Alert.alert(
                  "Xác nhận xoá",
                  `Bạn có chắc muốn xoá ${selectedItems.length} sản phẩm?`,
                  [
                    { text: "Huỷ" },
                    {
                      text: "Xoá",
                      style: "destructive",
                      onPress: async () => {
                        for (const itemId of selectedItems) {
                          await removeFromCartAPI(itemId, token);
                          removeFromCart(itemId);
                        }
                        setSelectedItems([]);
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.deleteBtnText}>Xoá đã chọn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.orderBtn, { flex: 1 }]}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.orderBtnText}>Đặt hàng</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  itemName: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  checkbox: {
    marginRight: 12,
  },
  orderBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#f44336",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,      // khoảng cách giữa 2 nút
  },

  deleteBtnText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "bold",
  },

  orderBtn: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 10,       // thêm marginTop cho khoảng cách với nội dung trên
    alignItems: "center" // căn chỉnh nút theo chiều dọc
  },
});

export default GioHang;
