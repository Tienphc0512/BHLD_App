import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ToastAndroid,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchDanhMuc, fetchSanPham } from '../service/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/Auth';

const TrangChu = ({ navigation }) => {
  const [danhmuc, setDanhmuc] = useState([]);
  const [sanpham, setSanpham] = useState([]);
  const [soluongs, setSoluongs] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { addToCart } = useCart();
  const { token } = useAuth();

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const danhmucRes = await fetchDanhMuc('', token);
      const sanphamRes = await fetchSanPham(token, '');
      setDanhmuc(danhmucRes);
      setSanpham(sanphamRes);
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  const handleIncrease = (id, max) => {
    setSoluongs(prev => {
      const current = prev[id] || 1;
      if (current < max) return { ...prev, [id]: current + 1 };
      ToastAndroid.show("Vượt quá tồn kho!", ToastAndroid.SHORT);
      return prev;
    });
  };

  const handleDecrease = (id) => {
    setSoluongs(prev => {
      const current = prev[id] || 1;
      return { ...prev, [id]: Math.max(current - 1, 1) };
    });
  };

  const handleAddToCart = (item) => {
    setSelectedProduct(item);
    setShowModal(true);
    setSoluongs(prev => ({ ...prev, [item.id]: prev[item.id] || 1 }));
  };

  const handleConfirmAddToCart = (sp) => {
    const sl = soluongs[sp.id] || 1;
    if (sl > sp.soluong) {
      ToastAndroid.show("Số lượng vượt quá tồn kho!", ToastAndroid.SHORT);
      return;
    }
    addToCart({ ...sp, soluong: sl });
    ToastAndroid.show(`${sp.ten_san_pham} đã thêm vào giỏ`, ToastAndroid.SHORT);
    setShowModal(false);
  };

  const handleSelectDanhMuc = (dm) => {
    navigation.navigate('Danh mục sản phẩm', { danhMucId: dm.id, ten: dm.ten });
  };

  const handleOrderNow = (sp) => {
    navigation.navigate("Đặt hàng", { sp });
  };

  return (
    <View style={styles.container}>
      {/* // HEADER + SEARCH + DANH MỤC */}
      <View style={styles.header}>
        <Text style={styles.title}>Trang chủ</Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => navigation.navigate("Thông báo")}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Tài khoản")}>
            <Ionicons name="person-circle-outline" size={26} color="#000" style={{ marginLeft: 12 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Chatbot")}>
            <Ionicons name="chatbubbles-outline" size={24} color="#000" style={{ marginLeft: 12 }} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 15 }} />
        <TextInput placeholder="Tìm sản phẩm, danh mục..." style={styles.searchInput} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <FlatList
          horizontal
          data={danhmuc}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.categoryButton} onPress={() => handleSelectDanhMuc(item)}>
              <Text style={styles.categoryText}>{item.ten}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>

      {/* SẢN PHẨM */}
      <FlatList
        data={sanpham}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        renderItem={({ item: sp }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: sp.anh_dai_dien || 'https://via.placeholder.com/150' }} style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={2}>{sp.ten_san_pham}</Text>
            <Text style={styles.productPrice}>{parseInt(sp.gia).toLocaleString()}₫</Text>
            <Text style={styles.quantityText}>Tồn kho: {sp.soluong}</Text>
            <View style={styles.buttonGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(sp)}>
                  <Text style={styles.buttonText}>Thêm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.orderButton} onPress={() => handleOrderNow(sp)}>
                  <Text style={styles.buttonText}>Mua</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.detailButton} onPress={() => navigation.navigate("Chi tiết sản phẩm", { item: sp })}>
                <Text style={styles.detailText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      />

      {/* MODAL */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Text style={styles.modalTitle}>{selectedProduct.ten_san_pham}</Text>
                <Text style={{ marginBottom: 10 }}>Tồn kho: {selectedProduct.soluong}</Text>
                <View style={styles.quantityRow}>
                  <TouchableOpacity onPress={() => handleDecrease(selectedProduct.id)}>
                    <Ionicons name="remove-circle-outline" size={36} color="#FF9800" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={soluongs[selectedProduct.id]?.toString() || '1'}
                    onChangeText={(text) => {
                      let val = parseInt(text);
                      if (isNaN(val) || val < 1) val = 1;
                      if (val > selectedProduct.soluong) val = selectedProduct.soluong;
                      setSoluongs(prev => ({ ...prev, [selectedProduct.id]: val }));
                    }}
                  />
                  <TouchableOpacity onPress={() => handleIncrease(selectedProduct.id, selectedProduct.soluong)}>
                    <Ionicons name="add-circle-outline" size={36} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirmAddToCart(selectedProduct)}>
                    <Text style={styles.buttonText}>OK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.confirmButton, { backgroundColor: '#999' }]} onPress={() => setShowModal(false)}>
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <View style={styles.floatingContainer}>
        <TouchableOpacity style={[styles.floatingBtn, { backgroundColor: '#3DDC97' }]} onPress={() => Linking.openURL('https://zalo.me/0909597886')}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.floatingBtn, { backgroundColor: '#4DA8F7', marginTop: 15 }]} onPress={() => Linking.openURL('tel:0909597886')}>
          <Ionicons name="call-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TrangChu;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#bcbdbdff',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  iconGroup: { flexDirection: 'row', alignItems: 'center' },
  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderRadius: 25,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: { fontSize: 15, fontWeight: '600', color: '#333' },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
  productImage: { width: '100%', height: 130, borderRadius: 10, marginBottom: 8 },
  productName: { fontSize: 15, fontWeight: '600', color: '#333', textAlign: 'center' },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#FF5722', textAlign: 'center', marginTop: 3 },
  quantityText: { fontSize: 12, color: '#555', textAlign: 'center', marginBottom: 5 },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  quantityInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, width: 60, height: 40, textAlign: 'center', marginHorizontal: 10, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
  confirmButton: { flex: 1, backgroundColor: '#FF9800', paddingVertical: 10, borderRadius: 10, marginHorizontal: 5,  alignItems: 'center', justifyContent: 'center' },
  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f1faee',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderRadius: 25,
    elevation: 2,
  },

  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#e0f2f1', // viền nhẹ
  },

  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  floatingContainer: {
    position: 'absolute',
    right: 15,
    bottom: 20,
    alignItems: 'center',
  },

  floatingBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,            // nâng cao hơn để nổi bật
    shadowColor: '#000',
    shadowOpacity: 0.25,     // hơi đậm để nổi bật
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
buttonGroup: { marginTop: 8 },

cartButton: { 
  flex: 1,
  backgroundColor: '#FFA726',
  marginRight: 5,
  borderRadius: 10,
  paddingVertical: 6,
  alignItems: 'center',
  justifyContent: 'center',
},

orderButton: { 
  flex: 1,
  backgroundColor: '#66BB6A',
  marginLeft: 5,
  borderRadius: 10,
  paddingVertical: 6,
  alignItems: 'center',
  justifyContent: 'center',
},

detailButton: {
  marginTop: 6,
  borderWidth: 1,
  borderColor: '#4DA8F7',
  borderRadius: 8,
  paddingVertical: 5,
  alignItems: 'center',
  justifyContent: 'center',
},


  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },

  detailText: {
    color: '#4DA8F7',
    fontWeight: '600',
    fontSize: 13,
  },


});
