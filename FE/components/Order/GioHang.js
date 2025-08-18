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
      .map((item) => ({ ...item }));

    navigation.navigate("Đặt hàng", { selectedProducts, token });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Checkbox
          value={selectedItems.includes(item.id)}
          onValueChange={() => toggleSelect(item.id)}
          style={styles.checkbox}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.ten} {item.ten_san_pham}</Text>
          <Text style={styles.itemDetail}>Số lượng: {item.soluong}</Text>
          <Text style={styles.itemDetail}>Giá: {parseInt(item.gia).toLocaleString()} VNĐ</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giỏ hàng</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có sản phẩm nào trong giỏ hàng.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
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
                <Text style={{ marginLeft: 8, fontWeight: "600" }}>Chọn tất cả</Text>
              </View>
            }
          />

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.deleteBtn]}
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
              style={[styles.orderBtn]}
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
  container: { flex: 1, backgroundColor: "#F5F7FA", paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#333" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  itemName: { fontWeight: "bold", fontSize: 16, color: "#222", marginBottom: 4 },
  itemDetail: { fontSize: 14, color: "#555" },
  checkbox: { marginRight: 12 },
  selectAllContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingBottom: 20,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f44336",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  deleteBtnText: { color: "#f44336", fontWeight: "bold", fontSize: 16 },
  orderBtn: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  orderBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#888" },
});

export default GioHang;
