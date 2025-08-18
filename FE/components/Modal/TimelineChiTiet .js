import React from "react";
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

export default function TimelineChiTiet({ visible, onClose, timeline }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Chi tiết trạng thái đơn hàng</Text>
          
         <FlatList
  data={timeline}
  keyExtractor={(_, index) => index.toString()}
  renderItem={({ item }) => (
    <View style={styles.timelineItem}>
      <Text style={styles.status}>{item.trangthai}</Text>
      <Text style={styles.time}>
        {item.thoigian ? new Date(item.thoigian).toLocaleString() : "Chưa có thời gian"}
      </Text>
    </View>
  )}
  ListEmptyComponent={
    <Text style={{ textAlign: "center", color: "#888", marginTop: 10 }}>
      Chưa có dữ liệu trạng thái
    </Text>
  }
/>


          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  timelineItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2980b9",
  },
  time: {
    fontSize: 14,
    color: "#555",
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#2980b9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
  },
});
