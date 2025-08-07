
// screens/INRScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet,
  Alert, FlatList, TouchableOpacity, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { exportAllAnalysisToPDF } from '../helpers/exportPDF';
import { VictoryLine, VictoryChart, VictoryTheme } from 'victory-native';

export default function INRScreen() {
  const [inr, setInr] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [history, setHistory] = useState([]);
  const [patientName, setPatientName] = useState('John Doe');
  const navigation = useNavigation();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys.filter(k => k.startsWith('inrAnalysis-')));
    const parsed = items.map(([_, v]) => JSON.parse(v));
    parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setHistory(parsed);
  };

  const logINR = async () => {
    if (!inr || !analysis) {
      Alert.alert('Please enter both INR and analysis');
      return;
    }
    const timestamp = new Date().toISOString();
    const entry = { inr: parseFloat(inr), text: analysis, timestamp };
    await AsyncStorage.setItem(`inrAnalysis-${timestamp}`, JSON.stringify(entry));
    setInr('');
    setAnalysis('');
    loadHistory();
  };

  const deleteEntry = async (timestamp) => {
    await AsyncStorage.removeItem(`inrAnalysis-${timestamp}`);
    loadHistory();
  };

  const handleExport = () => {
    exportAllAnalysisToPDF(history, patientName);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Patient Name</Text>
      <TextInput value={patientName} onChangeText={setPatientName} style={styles.input} />

      <Text style={styles.label}>INR Value</Text>
      <TextInput keyboardType="decimal-pad" value={inr} onChangeText={setInr} style={styles.input} />

      <Text style={styles.label}>Analysis Summary</Text>
      <TextInput
        value={analysis}
        onChangeText={setAnalysis}
        style={styles.textArea}
        multiline
        numberOfLines={4}
      />

      <Button title="Log INR" onPress={logINR} />
      <View style={styles.spacer} />
      <Button title="View Full INR Chart" onPress={() => navigation.navigate('Chart')} />
      <View style={styles.spacer} />
      <Button title="Export PDF Report" onPress={handleExport} />

      {history.length > 0 && (
        <>
          <Text style={styles.label}>INR Trend (Preview)</Text>
          <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}>
            <VictoryLine
              data={history.map((h) => ({ x: new Date(h.timestamp), y: h.inr }))}
              interpolation="monotoneX"
              style={{ data: { stroke: '#007AFF' } }}
            />
          </VictoryChart>
        </>
      )}

      <Text style={styles.label}>Recent Readings</Text>
      <View style={{ flexGrow: 1 }}>
        <FlatList
          data={history}
          keyExtractor={(item) => item.timestamp}
          renderItem={({ item }) => (
            <View style={styles.entry}>
              <Text style={{ flex: 1 }}>
                {new Date(item.timestamp).toLocaleString()} — INR: {item.inr}
              </Text>
              <TouchableOpacity onPress={() => deleteEntry(item.timestamp)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: 'bold', marginTop: 15 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginTop: 5 },
  textArea: { borderWidth: 1, padding: 10, borderRadius: 5, marginTop: 5, height: 80 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingBottom: 5,
  },
  delete: {
    marginLeft: 10,
    fontSize: 18,
    color: 'red',
  },
  spacer: { height: 10 },
});
