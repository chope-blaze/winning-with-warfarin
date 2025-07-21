// screens/MoreScreen.js
import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>More Screen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
