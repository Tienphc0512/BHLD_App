import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ToastAndroid,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { fetchChiTietSanPham } from '../service/api';
import { useAuth } from '../context/Auth';

const { width } = Dimensions.get('window');
const DEFAULT_IMAGE = 'https://via.placeholder.com/150';

const ChiTietSanPham = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;
  const [sanpham, setSanpham] = useState(null);
  const [soluong, setSoluong] = useState(1);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const loadChiTiet = async () => {
      try {
        const data = await fetchChiTietSanPham(item.id, token);
        setSanpham(data);
      } catch (err) {
        Alert.alert('Lỗi', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadChiTiet();
  }, []);

  const handleIncrease = () => {
    const tonKho = parseInt(sanpham.soluong);
    const current = parseInt(soluong) || 0;
    if (current + 1 > tonKho) {
      Alert.alert('Thông báo', 'Số lượng vượt quá tồn kho!');
    } else {
      setSoluong(current + 1);
    }
  };

  const handleDecrease = () => {
    const current = parseInt(soluong) || 1;
    setSoluong(current > 1 ? current - 1 : 1);
  };

  const handleAddToCart = (item) => {
    const parsedSoLuong = parseInt(soluong);
    const validatedSoluong = !parsedSoLuong || parsedSoLuong <= 0 ? 1 : parsedSoLuong;
    addToCart({ ...item, soluong: validatedSoluong });
    ToastAndroid.show(`${item.ten} đã được thêm vào giỏ`, ToastAndroid.SHORT);
  };

  const handleChangeSoluong = (text, max) => {
    if (text.trim() === '') {
      setSoluong('');
      return;
    }
    const newValue = parseInt(text);
    if (isNaN(newValue)) return;
    if (newValue > max) {
      Alert.alert('Thông báo', `Số lượng vượt quá tồn kho! (Tối đa: ${max})`);
      setSoluong(max.toString());
    } else {
      setSoluong(text);
    }
  };

  const handleOrderNow = () => {
    const parsedSoluong = parseInt(soluong);
    if (!parsedSoluong || parsedSoluong <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ (ít nhất 1)');
      return;
    }
    if (parsedSoluong > parseInt(sanpham.soluong)) {
      Alert.alert('Lỗi', 'Số lượng vượt quá tồn kho');
      return;
    }
    navigation.navigate('Đặt hàng', {
      sp: {
        ...sanpham,
        soluong,
        ten_san_pham: sanpham.ten,
        anh_dai_dien: sanpham.anh_dai_dien || sanpham.hinhanh?.[0] || '',
      },
    });
  };

  if (loading || !sanpham) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Đang tải chi tiết sản phẩm...</Text>
      </View>
    );
  }

  const hinhAnhArray = sanpham?.hinhanh?.length > 0 ? sanpham.hinhanh : [sanpham.anh_dai_dien || DEFAULT_IMAGE];

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Ảnh sản phẩm */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {hinhAnhArray.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </ScrollView>
        <Text style={styles.swipeHint}>← Vuốt để xem thêm ảnh →</Text>

        {/* Thông tin chính */}
        <View style={styles.box}>
          <Text style={styles.name}>{sanpham.ten}</Text>
          <Text style={styles.price}>{parseInt(sanpham.gia).toLocaleString()} đ</Text>
          <Text style={styles.stock}>Tồn kho: {sanpham.soluong}</Text>
        </View>

        {/* Mô tả */}
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.desc}>{sanpham.mota || 'Không có mô tả.'}</Text>
        </View>

        {/* Số lượng */}
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Số lượng</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={handleDecrease}>
              <Ionicons name="remove-circle-outline" size={36} color="black" />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={soluong.toString()}
              onChangeText={(text) => handleChangeSoluong(text, sanpham.soluong)}
            />
            <TouchableOpacity onPress={handleIncrease}>
              <Ionicons name="add-circle-outline" size={36} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Nút hành động cố định dưới cùng */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(sanpham)}>
          <Text style={styles.buttonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderNow}>
          <Text style={styles.buttonText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: width,
    height: width,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  swipeHint: {
    textAlign: 'center',
    color: '#888',
    marginTop: 6,
    marginBottom: 12,
  },
  box: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  price: {
    fontSize: 20,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stock: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    width: 70,
    height: 40,
    textAlign: 'center',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 12,
    backgroundColor: '#fff',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: 12,
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#388e3c',
    padding: 14,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  orderButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChiTietSanPham;
