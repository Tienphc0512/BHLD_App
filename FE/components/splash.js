import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Đăng nhập');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/antiico.png')}  
        style={styles.image}
        resizeMode="contain" 
      />
      <Text style={styles.mainTitle}>AnTiiCo</Text>
      <Text style={styles.subTitle}>Bao Ho Lao Dong</Text>
    </View>
  );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#c9c9c9ff', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '300%', 
    height: undefined,
    aspectRatio: 4,
  },
mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D9822B', // pastel cam nhẹ
    letterSpacing: 2,
    marginTop: -50,
  },
  subTitle: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
});
