import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const exportAllAnalysisToCSV = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const analysisKeys = keys.filter(k => k.startsWith('inrAnalysis-'));
    const items = await AsyncStorage.multiGet(analysisKeys);
    const parsed = items.map(([k, v]) => JSON.parse(v));

    if (parsed.length === 0) {
      alert('No analyses found to export.');
      return;
    }

    const csv = [
      ['Timestamp', 'INR', 'Analysis'],
      ...parsed.map(p => [
        p.timestamp,
        p.inr,
        `"${p.text.replace(/"/g, '""')}"`
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const fileUri = FileSystem.documentDirectory + 'inr_analyses.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv);
    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Failed to export CSV file.');
  }
};
