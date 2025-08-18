import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { useAuth } from '../../context/Auth';
import { fetchCancelDetailsHis } from '../../service/api';
import Thongtingiaohang from '../Modal/Thongtingiaohang';

export default function DonHangDaHuy() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    //modal thông tin giao hàng 
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);
    //mở rộng đơn hàng
      const [expandedOrders, setExpandedOrders] = useState([]);

    const loadCancelledOrders = async () => {
        try {
            setRefreshing(true);
            const result = await fetchCancelDetailsHis(token); // Gọi API lấy lịch sử huỷ
            console.log('Dữ liệu trả về:', result); //debug
            setOrders(result || []);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng đã huỷ:', error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCancelledOrders();
    }, []);

    //xử lý modal
    const showShippingInfo = (orderInfo) => {
  setSelectedOrderInfo({
    username: orderInfo.username || 'Không xác định',
    sdt: orderInfo.sdt || 'Chưa có',
    diachi: orderInfo.diachi || 'Chưa cung cấp',
  });
  setModalVisible(true);
};


// Nhóm đơn hàng
const groupedOrders = orders.reduce((acc, item) => {
  const existing = acc.find(o => o.dathang_id === item.dathang_id);
  if (existing) {
    existing.sanpham.push({
      ten: item.tensanpham || item.ten || 'Chưa có tên',
      soluong: item.soluong || 0,
      dongia: item.dongia || 0,
      tongtien: item.tongtien || 0,
    });
    existing.tongtien += item.tongtien || 0;
  } else {
    acc.push({
      dathang_id: item.dathang_id,
      username: item.username,
      sdt: item.sdt,
      diachi: item.diachi,
      ngayhuy: item.ngayhuy,
      tongtien: item.tongtien || 0,
      sanpham: [{
        ten: item.tensanpham || item.ten || 'Chưa có tên',
        soluong: item.soluong || 0,
        dongia: item.dongia || 0,
        tongtien: item.tongtien || 0,
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

//    const renderItem = ({ item }) => {
//   const sanpham = item.sanpham || [];
//   const isExpanded = expandedOrders.includes(item.dathang_id);

//   return (
//     <View style={styles.orderItem}>
//       <Text style={styles.orderCode}>Mã đơn: {item.dathang_id}</Text>

//       {/* Hiển thị sản phẩm */}
//       {sanpham.length === 1 ? (
//         <View>
//           <Text style={{ fontWeight: 'bold' }}>{sanpham[0].ten}</Text>
//           <Text>Số lượng: {sanpham[0].soluong}</Text>
//           <Text>Đơn giá: {Number(sanpham[0].dongia).toLocaleString()}đ</Text>
//         </View>
//       ) : (
//         <View>
//           <Text style={{ fontWeight: 'bold' }}>{sanpham[0].ten}</Text>
//           <Text>Số lượng: {sanpham[0].soluong}</Text>
//           <Text>Đơn giá: {Number(sanpham[0].dongia).toLocaleString()}đ</Text>

//           {!isExpanded && <Text>...và {sanpham.length - 1} sản phẩm khác</Text>}

//           {isExpanded &&
//             sanpham.slice(1).map((sp, idx) => (
//               <View key={idx + 1}>
//                 <Text style={{ fontWeight: 'bold' }}>{sp.ten}</Text>
//                 <Text>Số lượng: {sp.soluong}</Text>
//                 <Text>Đơn giá: {Number(sp.dongia).toLocaleString()}đ</Text>
//               </View>
//             ))}

//           <TouchableOpacity onPress={() => toggleExpand(item.dathang_id)}>
//             <Text style={{ color: '#2980b9', marginTop: 4, textDecorationLine: 'underline' }}>
//               {isExpanded ? 'Thu gọn' : 'Xem thêm'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
    
//       <Text style={styles.infoText}>Tổng tiền: {Number(item.sanpham[0].tongtien).toLocaleString()}đ</Text>
//       <Text style={styles.infoText}>Ngày huỷ: {new Date(item.ngayhuy).toLocaleString()}</Text>

//       <TouchableOpacity onPress={() => showShippingInfo(item)}>
//         <Text style={{ color: '#2980b9', marginTop: 10, fontWeight: 'bold' }}>
//           Thông tin giao hàng
//         </Text>
//       </TouchableOpacity>

//       <Text style={[styles.infoText, { color: '#e74c3c' }]}>Đơn hàng đã huỷ</Text>
//     </View>
//   );
// };

const renderItem = ({ item }) => {
  const sanpham = item.sanpham || [];
  const isExpanded = expandedOrders.includes(item.dathang_id);

  return (
    <View style={styles.orderItem}>
      <View style={styles.header}>
        <Text style={styles.orderCode}>Mã đơn: {item.dathang_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#e74c3c' }]}>
          <Text style={styles.statusText}>Đã huỷ</Text>
        </View>
      </View>

      <View style={styles.productContainer}>
        {sanpham.slice(0, 1).map((sp, idx) => (
          <View key={idx} style={styles.productItem}>
            <Text style={styles.productName}>{sp.ten}</Text>
            <Text>Số lượng: {sp.soluong}</Text>
            <Text>Đơn giá: {Number(sp.dongia).toLocaleString()}đ</Text>
          </View>
        ))}

        {sanpham.length > 1 && !isExpanded && (
          <Text style={styles.moreText}>...và {sanpham.length - 1} sản phẩm khác</Text>
        )}

        {isExpanded &&
          sanpham.slice(1).map((sp, idx) => (
            <View key={idx + 1} style={styles.productItem}>
              <Text style={styles.productName}>{sp.ten}</Text>
              <Text>Số lượng: {sp.soluong}</Text>
              <Text>Đơn giá: {Number(sp.dongia).toLocaleString()}đ</Text>
            </View>
          ))}

        {sanpham.length > 1 && (
          <TouchableOpacity onPress={() => toggleExpand(item.dathang_id)}>
            <Text style={styles.toggleText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.infoText}>Tổng tiền: {Number(item.sanpham[0].tongtien).toLocaleString()}đ</Text>
      <Text style={styles.infoText}>Ngày huỷ: {new Date(item.ngayhuy).toLocaleString()}</Text>

      <TouchableOpacity onPress={() => showShippingInfo(item)}>
        <Text style={styles.linkText}>Thông tin giao hàng</Text>
      </TouchableOpacity>
    </View>
  );
};
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={groupedOrders}
                 keyExtractor={(item) => item.dathang_id.toString()} 
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadCancelledOrders} />
                }
                ListEmptyComponent={<Text style={styles.empty}>Không có đơn hàng đã huỷ.</Text>}
            />
            <Thongtingiaohang
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                orderInfo={selectedOrderInfo}
            />
        </View>
    );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f9fc', padding: 16 },
  orderItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderColor: '#dcdde1',
    borderWidth: 1,
    elevation: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCode: { fontWeight: 'bold', fontSize: 16, color: '#34495e' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  productContainer: { marginTop: 8 },
  productItem: { marginBottom: 6 },
  productName: { fontWeight: 'bold' },
  moreText: { color: '#7f8c8d', fontStyle: 'italic' },
  toggleText: { color: '#2980b9', textDecorationLine: 'underline', marginTop: 4 },
  infoText: { fontSize: 15, color: '#2f3640', marginBottom: 2 },
  linkText: { color: '#2980b9', marginTop: 8, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 16 },
});