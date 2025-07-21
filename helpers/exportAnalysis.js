import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function shareAnalysis(text) {
  try {
    const fileUri = FileSystem.documentDirectory + 'inr_analysis.txt';
    await FileSystem.writeAsStringAsync(fileUri, text);
    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Error sharing analysis:', error);
  }
}
