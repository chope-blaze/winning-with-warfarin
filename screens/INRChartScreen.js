// screens/INRChartScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { OPENAI_API_KEY } from '@env';

export default function INRChartScreen() {
  const [data, setData] = useState([]);
  const [language] = useState(Localization.locale.split('-')[0]);

  useEffect(() => {
    (async () => {
      const keys = await AsyncStorage.getAllKeys();
      const analysisKeys = keys.filter(k => k.startsWith('inrAnalysis-'));
      const items = await AsyncStorage.multiGet(analysisKeys);
      const parsed = items.map(([_, v]) => JSON.parse(v)).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setData(parsed);
    })();
  }, []);

  const labels = data.map(item => new Date(item.timestamp).toLocaleDateString(language));
  const values = data.map(item => item.inr);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>INR Chart</Text>
      {data.length > 0 ? (
        <LineChart
          data={{
            labels,
            datasets: [{ data: values }]
          }}
          width={Dimensions.get('window').width - 20}
          height={300}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: () => `#007AFF`,
            labelColor: () => '#555',
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#007AFF' }
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text>No INR data yet</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  chart: { marginVertical: 8, borderRadius: 16 }
});
