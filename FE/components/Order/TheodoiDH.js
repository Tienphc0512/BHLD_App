import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/Auth";
import { fetchOrderDetails } from "../../service/api";
import DhTopTabs from "./DhTopTabs"; 

const Tab = createMaterialTopTabNavigator();

export default function TheodoiDH() {
  const { token, userId } = useAuth();
  const route = useRoute();
  const { orderInfo } = route.params || {};

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async (id) => {
    try {
      setRefreshing(true);
      const result = await fetchOrderDetails(id, token);
      setOrders(result || []);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderInfo) {
      loadOrders(userId);
    } else {
      setOrders([orderInfo]);
      setLoading(false);
    }
  }, [userId]);

  const initialTab = orderInfo
  ? orderInfo.trangthai === 'choxuly' ? 'Chờ xử lý' :
    orderInfo.trangthai === 'danggiao' ? 'Đang giao' :
    orderInfo.trangthai === 'hoanthanh' ? 'Đã giao' :
    orderInfo.trangthai === 'dahuy' ? 'Đã huỷ' :
    'Tất cả'
  : 'Tất cả';


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <Tab.Navigator
    initialRouteName={initialTab}
 screenOptions={{
  tabBarScrollEnabled: true,
    tabBarStyle: {
      backgroundColor: "#fff",   // nền trắng gọn gàng
      elevation: 0,              // bỏ bóng đổ mặc định
    },
    tabBarItemStyle: {
       width: "auto", 
       paddingHorizontal: 16,     
    },
    tabBarLabelStyle: {
      fontSize: 14,
      textTransform: "none",
      fontWeight: "bold",
      color: "#2980b9", // màu chữ tab
    },
    tabBarIndicatorStyle: {
      backgroundColor: "#2980b9",
      height: 2,
    },
  }}
>
  <Tab.Screen
    name="Tất cả"
    children={() => <DhTopTabs orders={orders} 
     refreshing={refreshing}
        onRefresh={() => loadOrders(userId)}/>}
  />
  <Tab.Screen
  name="Chờ xử lý"
  children={() => <DhTopTabs orders={orders.filter(o => o.trangthai === "choxuly")} 
   refreshing={refreshing}
        onRefresh={() => loadOrders(userId)}/>}
  />
  <Tab.Screen
    name="Đang giao"
    children={() => <DhTopTabs orders={orders.filter(o => o.trangthai === "danggiao")} 
     refreshing={refreshing}
        onRefresh={() => loadOrders(userId)}/>}

  />
    <Tab.Screen
    name="Đã giao"
    children={() => <DhTopTabs orders={orders.filter(o => o.trangthai === "hoanthanh")} 
     refreshing={refreshing}
        onRefresh={() => loadOrders(userId)}/>}

  />
  <Tab.Screen
    name="Đã huỷ"
    children={() => <DhTopTabs orders={orders.filter(o => o.trangthai === "dahuy")} 
     refreshing={refreshing}
        onRefresh={() => loadOrders(userId)}/>}
        />
</Tab.Navigator>

  );
}
