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
  Linking,
  RefreshControl
} from 'react-native';
import { fetchDanhMuc, fetchSanPham } from '../service/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/Auth';


const TrangChu = ({ navigation }) => {
  const [danhmuc, setDanhmuc] = useState([]);
  const [sanpham, setSanpham] = useState([]);
  // const [filteredSanPham, setFilteredSanPham] = useState([]);
  // const [search, setSearch] = useState('');
  const { addToCart } = useCart();
  const { token } = useAuth();
  // const [soluong, setSoluong] = useState(1);
  const [soluongs, setSoluongs] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [refreshing, setRefreshing] = useState(false);


  const fetchData = async () => {
    setRefreshing(true);
    try {
      const danhmucRes = await fetchDanhMuc('', token);
      setDanhmuc(danhmucRes);

      const sanphamRes = await fetchSanPham(token, '');
      setSanpham(sanphamRes);

    } catch (err) {
      console.error('Lỗi khi load dữ liệu:', err.response?.data || err.message);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);



  // hàm xử lý khi user tăng số lượng sp
  const handleIncrease = (productId, tonKho) => {
    setSoluongs((prev) => {
      const current = prev[productId] || 1;
      if (current < tonKho) {
        return { ...prev, [productId]: current + 1 };
      }
      ToastAndroid.show("Vượt quá tồn kho!", ToastAndroid.SHORT);
      return prev;
    });
  };

  //hàm giảm số lượng sp
  const handleDecrease = (productId) => {
    setSoluongs((prev) => {
      const current = prev[productId] || 1;
      return { ...prev, [productId]: Math.max(current - 1, 1) };
    });
  };

  // hàm xác nhận khi user thêm sp vào giỏ vì có sử dụng modal
  const handleConfirmAddToCart = (sp) => {
    const sl = soluongs[sp.id] || 1;
    const tonKho = parseInt(sp.soluong);

    if (sl > tonKho) {
      ToastAndroid.show("Số lượng vượt quá tồn kho!", ToastAndroid.SHORT);
      return;
    }
    // console.log('Add to cart:', sp);
    addToCart({ ...sp, soluong: sl });
    ToastAndroid.show(`${sp.ten_san_pham} đã được thêm vào giỏ`, ToastAndroid.SHORT);
    setSelectedProductId(null); // ẩn lại khung nhập sau khi thêm
  };

  //thêm sp vào giỏ
  const handleAddToCart = (item) => {
    setSelectedProduct(item);
    setShowModal(true);
    setSoluongs((prev) => ({
      ...prev,
      [item.id]: prev[item.id] || 1,
    }));
  };


  // hàm xử lý số lượng khi nhập tay 
  const handleChangeSoluong = (text, productId, max) => {
    const newValue = parseInt(text);

    if (!text || isNaN(newValue) || newValue <= 0) {
      setSoluongs((prev) => ({
        ...prev,
        [productId]: '',
      }));
      return;
    }

    if (newValue > max) {
      ToastAndroid.show('Thông báo', `Số lượng vượt quá tồn kho! (Tối đa: ${max})`), ToastAndroid.SHORT;
      setSoluongs((prev) => ({
        ...prev,
        [productId]: max,
      }));
    } else {
      setSoluongs((prev) => ({
        ...prev,
        [productId]: newValue,
      }));
    }
  };

  const handleSelectDanhMuc = (selectedDanhMuc) => {
    navigation.navigate('Danh mục sản phẩm', { danhMucId: selectedDanhMuc.id, ten: selectedDanhMuc.ten });
  };

  // điều hướng qua đặt hàng với item và số lượng đã chọn
  const handleOrderNow = (sp) => {
    // điều hướng qua màn hình Đặt hàng với sản phẩm đã chọn
    navigation.navigate("Đặt hàng", {
      sp: sp, // giữ nguyên sản phẩm, không chỉnh sửa 'soluong'
    });
  };
  const handleSearch = () => {
    ToastAndroid.show("Tính năng này sẽ được phát triển sau", ToastAndroid.SHORT);
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trang Chủ</Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => navigation.navigate("Thông báo")}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Tài khoản")}>
            <Ionicons name="person-circle-outline" size={26} color="#000" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Chatbot")}>
            <Ionicons name="chatbubbles-outline" size={24} color="#000" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Tìm sản phẩm, danh mục..."
            style={styles.searchInput}
          />
        </View>
      </View>
      {/* DANH MỤC - lướt ngang */}
      <Text style={styles.heading}>Danh mục</Text>
      <FlatList
        horizontal
        data={danhmuc}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => handleSelectDanhMuc(item)}
          >
             <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.categoryText}>{item.ten}</Text>
            </View>
          </TouchableOpacity>

        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 10, paddingBottom: 15 }} // thêm paddingBottom ở đây
        style={{ marginBottom: 15 }} // hoặc thêm marginBottom ở đây để tách hẳn FlatList danh mục và sản phẩm
      />

      {/* SẢN PHẨM - lưới 2 cột, lướt dọc */}
      <Text style={[styles.heading, { marginTop: 20 }]}>Sản phẩm</Text>
      <FlatList
        data={sanpham}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        renderItem={({ item: sp }) => (
          <View style={styles.productCard}>
            <Image
              source={{ uri: sp.anh_dai_dien || 'https://via.placeholder.com/150' }}
              style={styles.productImage}
            />
            <Text style={styles.productName} numberOfLines={2}>{sp.ten_san_pham}</Text>
            <Text style={styles.productPrice}>{parseInt(sp.gia).toLocaleString()}₫</Text>
            <Text style={styles.quantityInput}>Tồn kho: {sp.soluong}</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(sp)}>
                <Text style={styles.buttonText}>Thêm</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.orderButton} onPress={() => handleOrderNow(sp)}>
                <Text style={styles.buttonText}>Mua</Text>
              </TouchableOpacity>

            </View>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => navigation.navigate("Chi tiết sản phẩm", { item: sp })}

            >
              <Text style={styles.detailText}>Chi tiết</Text>
            </TouchableOpacity>

          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsWrapper}
      />
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn số lượng</Text>

            {selectedProduct && (
              <>
                <Text style={styles.productName}>{selectedProduct.ten_san_pham}</Text>
                <Text style={styles.productPrice}>Tồn kho: {selectedProduct.soluong}</Text>

                <View style={styles.quantityRow}>
                  <TouchableOpacity onPress={() => handleDecrease(selectedProduct.id)}>
                    <Ionicons name="remove-circle-outline" size={32} />
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
                    <Ionicons name="add-circle-outline" size={32} />
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
      <View style={styles.floatingContainer}>
        <TouchableOpacity style={[styles.floatingBtn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL('https://zalo.me/0909597886')}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.floatingBtn, { backgroundColor: '#2196F3', marginTop: 15 }]} onPress={() => Linking.openURL('tel:0909597886')}>
          <Ionicons name="call-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>



    </View>
  )
}

export default TrangChu;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     paddingHorizontal: 10,
//     paddingTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,

//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   iconGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   searchBar: {
//     backgroundColor: '#f1f1f1',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     fontSize: 16,
//     marginBottom: 15,
//   },
//   heading: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginVertical: 10,
//   },
//   categoryButton: {
//     backgroundColor: '#e0e0e0',
//     borderRadius: 16,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     marginRight: 12,
//     minWidth: 100,          // thêm minWidth để nút đủ rộng chứa chữ
//     minHeight: 45,          // chiều cao ổn định
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   categoryText: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   productsWrapper: {
//     paddingBottom: 20,
//     paddingHorizontal: 5,
//   },

//   productCard: {
//     width: '48%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 39,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },

//   productImage: {
//     width: '100%',
//     height: 120,
//     borderRadius: 8,
//     marginBottom: 8,
//     resizeMode: 'cover',
//   },

//   productName: {
//     fontSize: 15,
//     fontWeight: '600',
//     textAlign: 'center',
//     marginBottom: 4,
//   },

//   productPrice: {
//     fontSize: 14,
//     color: '#d32f2f',
//     marginBottom: 6,
//     textAlign: 'center',
//   },

//   quantityInput: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     width: 140,
//     textAlign: 'center',
//     alignSelf: 'center',
//     marginBottom: 6,
//   },

//   buttonGroup: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },

//   cartButton: {
//     backgroundColor: '#ffa000',
//     borderRadius: 6,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     flex: 1,
//     marginRight: 5,
//     alignItems: 'center',
//   },

//   orderButton: {
//     backgroundColor: '#4caf50',
//     borderRadius: 6,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     flex: 1,
//     alignItems: 'center',
//   },



//   detailButton: {
//     backgroundColor: '#2196f3',
//     borderRadius: 6,
//     marginTop: 6,
//     paddingVertical: 6,
//     alignItems: 'center',
//   },

//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center', // hoặc 'space-between' nếu bạn muốn nút OK nằm dưới
//     width: '80%',
//     maxHeight: '80%',
//   },

//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   quantityRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   modalButtons: {
//     marginTop: 20,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },

//   confirmButton: {
//     backgroundColor: '#2196F3',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },

//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },

//   floatingContainer: {
//     position: 'absolute',
//     right: 20,
//     bottom: 20,
//     alignItems: 'center',
//   },

//   floatingBtn: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 3 },
//   },


// });
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // nền xám nhạt hiện đại
    paddingHorizontal: 10,
    paddingTop: 25,
  },
  header: {
    backgroundColor: '#bebcbcff',
    paddingTop: 35, // tạo khoảng cho status bar
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  
  },
  // Search box sẽ nằm ngay dưới header
  searchWrapper: {
    paddingHorizontal: 15,
    // marginTop: -3, // đẩy lên sát header bo góc
    marginBottom: 12,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 42,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
categoryButton: {
  backgroundColor: '#fff',
  borderRadius: 16,
  height: 55,               // Chiều cao cố định
  paddingHorizontal: 20,
  marginRight: 12,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  minWidth: 100,
  justifyContent: 'center', // Căn giữa dọc
  alignItems: 'center',     // Căn giữa ngang
  elevation: 1,
},
categoryText: {
  fontSize: 16,
  color: '#333',
  fontWeight: '800',
  textAlign: 'center',
  includeFontPadding: false,    // Android: bỏ padding mặc định
  textAlignVertical: 'center',  // Android: căn giữa vertical
  lineHeight: 22,               // > fontSize để tránh lẹm
},
  productsWrapper: {
    paddingBottom: 20,
    paddingHorizontal: 5,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: 140,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartButton: {
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  orderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flex: 1,
    alignItems: 'center',
  },
  detailButton: {
    backgroundColor: '#1976D2',
    borderRadius: 6,
    marginTop: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  detailText: {
    color: '#fff',
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    maxHeight: '80%',
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
