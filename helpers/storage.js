import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPENAI_API_KEY } from '@env';

export const getTodayMeals = async () => {
  try {
    const todayKey = new Date().toISOString().split('T')[0]; // e.g. '2025-07-21'
    const diary = await AsyncStorage.getItem(`foodDiary-${todayKey}`);
    return diary ? JSON.parse(diary) : [];
  } catch (err) {
    console.error('Error loading meals:', err);
    return [];
  }
};

export const saveAnalysis = async (inr, text) => {
  const timestamp = new Date().toISOString();
  const key = `inrAnalysis-${timestamp}`;
  const data = {
    inr,
    text,
    timestamp,
  };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving INR analysis:', error);
  }
};

export const deleteAnalysis = async (timestamp) => {
  const key = `inrAnalysis-${timestamp}`;
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting INR analysis:', error);
  }
};

