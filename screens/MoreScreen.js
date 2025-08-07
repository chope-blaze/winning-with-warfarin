// screens/MoreScreen.js
import React, { useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { OPENAI_API_KEY } from '@env';

export default function MoreScreen() {
  useEffect(() => {
    console.log('OPENAI_API_KEY:', OPENAI_API_KEY); // 🔍 Console log to verify import
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>OpenAI Key Loaded</Text>
      <Text numberOfLines={1} ellipsizeMode="middle" style={styles.key}>
        {OPENAI_API_KEY}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
  },
  key: {
    fontSize: 12,
    color: 'gray',
  },
});
