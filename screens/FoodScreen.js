import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { USDA_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function FoodScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [diary, setDiary] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [unitFilter, setUnitFilter] = useState('all');
  const [dataTypes, setDataTypes] = useState(['Foundation', 'Branded']);
  const [nutrientFilter, setNutrientFilter] = useState('');
  const [searchCache, setSearchCache] = useState({});

  const navigation = useNavigation();

  useEffect(() => {
    loadDiary();
    loadSearchCache();
    loadFilters();
  }, []);

  const loadDiary = async () => {
    try {
      const saved = await AsyncStorage.getItem('foodDiary');
      if (saved) setDiary(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load diary', error);
    }
  };

  const saveDiary = async (newDiary) => {
    try {
      await AsyncStorage.setItem('foodDiary', JSON.stringify(newDiary));
    } catch (error) {
      console.error('Failed to save diary', error);
    }
  };

  const loadSearchCache = async () => {
    try {
      const cached = await AsyncStorage.getItem('usdaSearchCache');
      if (cached) setSearchCache(JSON.parse(cached));
    } catch (error) {
      console.error('Failed to load search cache:', error);
    }
  };

  const loadFilters = async () => {
    try {
      const saved = await AsyncStorage.getItem('userFilters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.unitFilter) setUnitFilter(parsed.unitFilter);
        if (parsed.dataTypes) setDataTypes(parsed.dataTypes);
        if (parsed.nutrientFilter !== undefined) setNutrientFilter(parsed.nutrientFilter);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const saveFilters = async (filters) => {
    try {
      await AsyncStorage.setItem('userFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  };

  useEffect(() => {
    saveFilters({ unitFilter, dataTypes, nutrientFilter });
  }, [unitFilter, dataTypes, nutrientFilter]);

 const handleSearch = async () => {
  const trimmedQuery = query.trim();
  console.log('✏️ Raw Query:', `"${query}"`);
  console.log('🔍 Trimmed Query:', `"${trimmedQuery}"`);

  if (!trimmedQuery || trimmedQuery.length < 2) {
    console.warn('⛔ Skipping API call. Invalid input:', `"${trimmedQuery}"`);
    Alert.alert('Search Error', 'Please enter at least 2 characters.');
    return;
  }

  // ✅ Reset input field before proceeding
  setQuery('');

  const normalizedQuery = trimmedQuery.toLowerCase();

  if (searchCache[normalizedQuery]) {
    console.log('⚡ Using cached results for:', normalizedQuery);
    setResults(searchCache[normalizedQuery]);
    return;
  }

  try {
    console.log('🚀 Calling API with:', `"${trimmedQuery}"`);

    const response = await axios.get(
      'https://api.nal.usda.gov/fdc/v1/foods/search',
      {
        params: {
          query: trimmedQuery,
          dataType: dataTypes,
          api_key: USDA_API_KEY,
        },
      }
    );

    let foods = response.data.foods || [];

    if (nutrientFilter) {
      foods = foods.filter((food) =>
        food.foodNutrients?.some((n) =>
          n.nutrientName?.toLowerCase().includes(nutrientFilter.toLowerCase())
        )
      );
    }

    setResults(foods);
    const updatedCache = { ...searchCache, [normalizedQuery]: foods };
    setSearchCache(updatedCache);
    await AsyncStorage.setItem('usdaSearchCache', JSON.stringify(updatedCache));
  } catch (error) {
    console.error('❌ API Search failed:', error.response?.data || error.message);
    Alert.alert('Search Failed', 'The USDA API is not responding as expected.');
  }
};


  const addToDiary = async (item) => {
    try {
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/food/${item.fdcId}?api_key=${USDA_API_KEY}`
      );
      const detailedFood = response.data;
      const updatedDiary = [...diary, detailedFood];
      setDiary(updatedDiary);
      await saveDiary(updatedDiary);
      Alert.alert('Added', `${detailedFood.description} added to diary.`);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Could not fetch nutrient info.');
    }
  };

  const deleteFromDiary = async (index) => {
    const updated = [...diary];
    updated.splice(index, 1);
    setDiary(updated);
    await saveDiary(updated);
  };

  const getNutrientTotals = () => {
    const totals = { vitaminK: 0, protein: 0, fiber: 0, fat: 0, vitaminC: 0 };
    diary.forEach((item) => {
      item.foodNutrients?.forEach((n) => {
        const name = n.nutrientName?.toLowerCase() || '';
        const value = n.value || 0;
        if (name.includes('vitamin k')) totals.vitaminK += value;
        if (name.includes('protein')) totals.protein += value;
        if (name.includes('fiber')) totals.fiber += value;
        if (name.includes('fat')) totals.fat += value;
        if (name.includes('vitamin c')) totals.vitaminC += value;
      });
    });
    return totals;
  };

  const formatUnit = (unit) => {
    if (unit.toLowerCase().includes('gram')) return 'g';
    if (unit.toLowerCase().includes('milligram')) return 'mg';
    if (unit.toLowerCase().includes('microgram')) return 'µg';
    return unit;
  };

  const filteredNutrients = (nutrients) => {
    return nutrients.filter((n) => {
      const name = n.nutrientName?.toLowerCase() || '';
      const value = n.value || 0;
      const unit = n.unitName || '';
      const wanted = ['vitamin k', 'protein', 'fiber', 'fat', 'vitamin c'];
      const matchName = wanted.some((w) => name.includes(w));
      const matchUnit = unitFilter === 'all' || formatUnit(unit) === unitFilter;
      return matchName && matchUnit && value > 0;
    });
  };

  const exportDiaryToCSV = async () => {
    if (diary.length === 0) {
      Alert.alert('No Data', 'Your diary is empty.');
      return;
    }

    const header = ['Description', 'Serving Size', 'Nutrient', 'Value', 'Unit'];
    let rows = [header.join(',')];

    diary.forEach((item) => {
      const desc = item.description;
      const serving = item.servingSize || '1';
      const nutrients = item.foodNutrients || [];
      const wanted = ['vitamin k', 'protein', 'fiber', 'fat', 'vitamin c'];

      nutrients.forEach((n) => {
        const name = n.nutrientName?.toLowerCase();
        const value = n.value || 0;
        const unit = n.unitName || '';
        if (wanted.some((w) => name.includes(w))) {
          rows.push(`"${desc}",${serving},"${n.nutrientName}",${value},${unit}`);
        }
      });
    });

    const csv = rows.join('\n');
    const fileUri = FileSystem.documentDirectory + 'food-diary.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri);
  };

  const totals = getNutrientTotals();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Food Tracker</Text>

      <TextInput
        placeholder="Search for food"
        value={query}
        onChangeText={setQuery}
        style={styles.searchBar}
      />

      <TextInput
        placeholder="Filter by nutrient (optional)"
        value={nutrientFilter}
        onChangeText={setNutrientFilter}
        style={styles.searchBar}
      />

      <View style={styles.buttonRow}>
        <Button title="Search" onPress={handleSearch} />
        <Button title="Export to CSV" onPress={exportDiaryToCSV} />
      </View>

      <View style={styles.filterBar}>
        {['all', 'g', 'mg', 'µg'].map((unit) => (
          <TouchableOpacity
            key={unit}
            onPress={() => setUnitFilter(unit)}
            style={[
              styles.filterButton,
              unitFilter === unit && { backgroundColor: '#cce5ff' },
            ]}
          >
            <Text>{unit}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        <Text style={styles.subheading}>Search Results</Text>
        {results.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => addToDiary(item)}>
            <Text>➕ {item.description}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.subheading}>Today's Food Diary</Text>
        {diary.map((item, index) => {
          const expanded = expandedIndex === index;
          return (
            <View key={index} style={styles.diaryItem}>
              <View style={{ flex: 1 }}>
                <Text>{item.description}</Text>
                <Text style={{ color: 'gray' }}>
                  {item.servingSize
                    ? `Serving: ${item.servingSize} ${item.servingSizeUnit || ''}`
                    : 'No serving info'}
                </Text>
                {expanded &&
                  filteredNutrients(item.foodNutrients || []).map((n, i) => (
                    <Text key={i}>
                      {n.nutrientName}: {n.value} {formatUnit(n.unitName)}
                    </Text>
                  ))}
              </View>
              <View>
                <TouchableOpacity onPress={() => deleteFromDiary(index)}>
                  <Text style={{ color: 'red' }}>🗑️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setExpandedIndex(expanded ? null : index)}
                >
                  <Text>{expanded ? '⬆️' : '⬇️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.section}>
          <Text style={styles.subheading}>🧮 Nutrient Totals</Text>
          <Text>Vitamin K: {totals.vitaminK.toFixed(2)} µg</Text>
          <Text>Protein: {totals.protein.toFixed(2)} g</Text>
          <Text>Fiber: {totals.fiber.toFixed(2)} g</Text>
          <Text>Fat: {totals.fat.toFixed(2)} g</Text>
          <Text>Vitamin C: {totals.vitaminC.toFixed(2)} mg</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  diaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  section: { marginVertical: 10 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
