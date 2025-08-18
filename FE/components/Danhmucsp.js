import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ToastAndroid,
  StyleSheet,
  FlatList
} from 'react-native';
import { fetchSanPham } from '../service/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/Auth';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const SanPhamTheoDanhMuc = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { danhMucId } = route.params;
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [sanPham, setSanPham] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soluongs, setSoluongs] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (token && danhMucId) {
      fetchSanPham(token, '')
        .then((data) => {
          const filtered = data.filter(sp => String(sp.danhmuc_id) === String(danhMucId));
          setSanPham(filtered);
        })
        .catch((error) => console.error("Lỗi khi fetch:", error.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, danhMucId]);

  const handleIncrease = (productId, tonKho) => {
    setSoluongs(prev => {
      const current = prev[productId] || 1;
      if (current < tonKho) return { ...prev, [productId]: current + 1 };
      ToastAndroid.show("Vượt quá tồn kho!", ToastAndroid.SHORT);
      return prev;
    });
  };

  const handleDecrease = (productId) => {
    setSoluongs(prev => {
      const current = prev[productId] || 1;
      return { ...prev, [productId]: Math.max(current - 1, 1) };
    });
  };

  const handleChangeSoluong = (text, productId, max) => {
    const newValue = parseInt(text);
    if (!text || isNaN(newValue) || newValue <= 0) {
      setSoluongs(prev => ({ ...prev, [productId]: '' }));
      return;
    }
    if (newValue > max) {
      ToastAndroid.show(`Tối đa tồn kho: ${max}`, ToastAndroid.SHORT);
      setSoluongs(prev => ({ ...prev, [productId]: max }));
    } else {
      setSoluongs(prev => ({ ...prev, [productId]: newValue }));
    }
  };

  const handleAddToCart = (item) => {
    setSelectedProduct(item);
    setShowModal(true);
    setSoluongs(prev => ({ ...prev, [item.id]: prev[item.id] || 1 }));
  };

  const handleConfirmAddToCart = (sp) => {
    const sl = soluongs[sp.id] || 1;
    const tonKho = parseInt(sp.soluong);
    if (sl > tonKho) {
      ToastAndroid.show("Số lượng vượt quá tồn kho!", ToastAndroid.SHORT);
      return;
    }
    addToCart({ ...sp, soluong: sl });
    ToastAndroid.show(`${sp.ten_san_pham} đã được thêm vào giỏ`, ToastAndroid.SHORT);
  };

  const handleOrderNow = (sp) => {
    navigation.navigate("Đặt hàng", { sp });
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />;

  if (sanPham.length === 0) return (
    <View style={styles.container}>
      <Text>Không có sản phẩm trong danh mục này.</Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={sanPham}
        keyExtractor={item => item?.id?.toString()}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.anh_dai_dien }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.ten_san_pham}</Text>
              <Text style={styles.price}>{parseInt(item.gia).toLocaleString()}₫</Text>
              <Text style={styles.quantityText}>Tồn kho: {item.soluong}</Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(item)}>
                  <Text style={styles.buttonText}>Thêm</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.orderButton} onPress={() => handleOrderNow(item)}>
                  <Text style={styles.buttonText}>Mua</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => navigation.navigate("Chi tiết sản phẩm", { item })}
                >
                  <Text style={styles.detailText}>Chi tiết</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn số lượng</Text>
            {selectedProduct && (
              <>
                <Text style={styles.productName}>{selectedProduct.ten_san_pham}</Text>
                <Text style={styles.productPrice}>Tồn kho: {selectedProduct.soluong}</Text>

                <View style={styles.quantityRow}>
                  <TouchableOpacity onPress={() => handleDecrease(selectedProduct.id)}>
                    <Ionicons name="remove-circle-outline" size={32} color="#E53935"/>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={soluongs[selectedProduct.id]?.toString() ?? ''}
                    onChangeText={(text) =>
                      handleChangeSoluong(text, selectedProduct.id, selectedProduct.soluong)
                    }
                  />

                  <TouchableOpacity onPress={() => handleIncrease(selectedProduct.id, selectedProduct.soluong)}>
                    <Ionicons name="add-circle-outline" size={32} color="#43A047"/>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      handleConfirmAddToCart(selectedProduct);
                      setShowModal(false);
                    }}
                  >
                    <Text style={styles.buttonText}>OK</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: '#999' }]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SanPhamTheoDanhMuc;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#F5F7FA',
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    color: '#E53935',
    fontWeight: '600',
    marginBottom: 6,
  },
  quantityText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  cartButton: {
    backgroundColor: '#43A047',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  orderButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  detailButton: {
  marginTop: 6,
  borderWidth: 1,
  borderColor: '#4DA8F7',
  borderRadius: 8,
  paddingVertical: 8,      // tăng chiều cao giống 2 nút kia
  paddingHorizontal: 16,   // tăng chiều ngang
  minWidth: 90,            // đặt chiều dài tối thiểu bằng 2 nút kia
  alignItems: 'center',
  justifyContent: 'center',
},

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  detailText: {
    color: '#1E88E5',
    fontWeight: '600',
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    width: '90%',
    borderRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    color: '#333',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    color: '#444',
  },
  productPrice: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
    textAlign: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 10,
    minWidth: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});
