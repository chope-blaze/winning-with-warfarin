import React, { useEffect, useState } from 'react';
x
import {
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Button,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { deleteAnalysis } from '../helpers/storage';
import { exportAllAnalysisToCSV } from '../helpers/exportCSV';
import { exportAllAnalysisToPDF } from '../helpers/exportPDF';
import * as Sharing from 'expo-sharing';

export default function AnalysisHistoryScreen() {
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const refreshData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const analysisKeys = keys.filter(k => k.startsWith('inrAnalysis-'));
      const items = await AsyncStorage.multiGet(analysisKeys);
      let parsed = items.map(([key, value]) => JSON.parse(value));

      if (fromDate && toDate) {
        parsed = parsed.filter(item => {
          const t = new Date(item.timestamp);
          return t >= fromDate && t <= toDate;
        });
      }

      parsed.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortOrder === 'asc'
          ? valA > valB ? 1 : -1
          : valA < valB ? 1 : -1;
      });

      setData(parsed);
    } catch (err) {
      console.error('Error loading past analyses:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [fromDate, toDate, sortField, sortOrder]);

  const handleDelete = async (timestamp) => {
    await deleteAnalysis(timestamp);
    refreshData();
  };

  const clearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setPatientName('');
  };

  const sharePDF = async () => {
    await exportAllAnalysisToPDF(data, patientName);
    refreshData();
  };

  const shareCSV = async () => {
    await exportAllAnalysisToCSV(data, patientName);
    refreshData();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      <Text style={styles.inr}>INR: {item.inr}</Text>
      <Text>{item.text.slice(0, 150)}...</Text>
      {item.nutrients && (
        <Text style={styles.nutrients}>
          Vit K: {item.nutrients.vitaminK ?? 'N/A'} μg, Protein: {item.nutrients.protein ?? 'N/A'} g, Fiber: {item.nutrients.fiber ?? 'N/A'} g
        </Text>
      )}
      <TouchableOpacity onPress={() => handleDelete(item.timestamp)}>
        <Text style={styles.delete}>🗑 Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Past INR Analyses</Text>

      <View style={styles.dateRow}>
        <Text style={styles.label}>Patient Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. John Smith"
          value={patientName}
          onChangeText={setPatientName}
        />

        <Text style={styles.label}>From:</Text>
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => date && setFromDate(date)}
        />

        <Text style={styles.label}>To:</Text>
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => date && setToDate(date)}
        />
      </View>

      <Button title="Clear Filters" onPress={clearFilters} />

      <View style={styles.sortButtons}>
        <Button title={`Sort by Time (${sortOrder})`} onPress={() => toggleSort('timestamp')} />
        <Button title={`Sort by INR (${sortOrder})`} onPress={() => toggleSort('inr')} />
      </View>

      <Button title="Export All to CSV" onPress={shareCSV} />
      <Button title="Export All to PDF" onPress={sharePDF} />

      <FlatList
        data={data}
        keyExtractor={item => item.timestamp}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: {
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  timestamp: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inr: {
    marginBottom: 6,
    fontStyle: 'italic',
  },
  nutrients: {
    fontSize: 13,
    marginTop: 4,
    color: '#555',
  },
  delete: {
    color: 'red',
    marginTop: 8,
  },
  dateRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
