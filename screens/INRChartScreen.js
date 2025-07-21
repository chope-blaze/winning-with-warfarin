// INRChartScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Button, Platform, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { shareAsync } from 'expo-sharing';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryZoomContainer, VictoryTooltip, VictoryLabel } from 'victory-native';
import * as Localization from 'expo-localization';

const translations = {
  en: {
    title: 'INR Trend Chart',
    export: 'Export Chart as Image',
    patient: 'Patient',
    inr: 'INR',
    time: 'Time',
    zoomTip: 'Pinch to zoom'
  },
  es: {
    title: 'Gráfico de tendencia INR',
    export: 'Exportar gráfico como imagen',
    patient: 'Paciente',
    inr: 'INR',
    time: 'Hora',
    zoomTip: 'Pellizcar para ampliar'
  },
  fr: {
    title: 'Graphique de tendance INR',
    export: 'Exporter le graphique comme image',
    patient: 'Patient',
    inr: 'INR',
    time: 'Temps',
    zoomTip: 'Pincer pour zoomer'
  },
  it: {
    title: 'Grafico andamento INR',
    export: 'Esporta grafico come immagine',
    patient: 'Paziente',
    inr: 'INR',
    time: 'Tempo',
    zoomTip: 'Pizzica per zoomare'
  },
  de: {
    title: 'INR-Trenddiagramm',
    export: 'Diagramm als Bild exportieren',
    patient: 'Patient',
    inr: 'INR',
    time: 'Zeit',
    zoomTip: 'Zum Zoomen zusammenziehen'
  }
};

export default function INRChartScreen() {
  const [data, setData] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [language, setLanguage] = useState(Localization.locale.split('-')[0]);
  const viewShotRef = useRef();
  const t = translations[language] || translations['en'];

  const loadData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const analysisKeys = keys.filter(k => k.startsWith('inrAnalysis-'));
      const items = await AsyncStorage.multiGet(analysisKeys);
      const parsed = items.map(([_, v]) => JSON.parse(v));
      parsed.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setData(parsed);
    } catch (err) {
      console.error('Error loading INR data:', err);
    }
  };

  const saveChart = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('INRCharts', asset, false);
      shareAsync(uri);
    } catch (err) {
      console.error('Error saving chart:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.languageSwitcher}>
        {Object.keys(translations).map(lang => (
          <TouchableOpacity key={lang} onPress={() => setLanguage(lang)} style={[styles.langBtn, language === lang && styles.activeLang]}>
            <Text>{lang.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.title}>{t.title}</Text>
      <Text style={styles.subtitle}>{t.zoomTip}</Text>

      <ViewShot ref={viewShotRef} style={{ backgroundColor: 'white' }}>
        <VictoryChart
          height={300}
          domainPadding={{ x: 50, y: 20 }}
          containerComponent={<VictoryZoomContainer zoomDimension="x" />}
        >
          <VictoryAxis
            tickFormat={(t) => new Date(t).toLocaleDateString(language)}
            label={t.time}
            style={{ axisLabel: { padding: 30 } }}
          />
          <VictoryAxis
            dependentAxis
            domain={[1, 5]}
            label={t.inr}
            style={{ axisLabel: { padding: 40 } }}
          />

          {/* Ideal INR Range */}
          <VictoryLine
            y={() => 2.0}
            style={{ data: { stroke: '#81C784', strokeDasharray: '5,5' } }}
          />
          <VictoryLine
            y={() => 3.0}
            style={{ data: { stroke: '#81C784', strokeDasharray: '5,5' } }}
          />

          <VictoryLine
            data={data.map(item => ({ x: new Date(item.timestamp), y: item.inr }))}
            style={{ data: { stroke: '#007AFF' } }}
          />

          <VictoryScatter
            data={data.map(item => ({ x: new Date(item.timestamp), y: item.inr, label: `${item.inr}\n${new Date(item.timestamp).toLocaleDateString(language)}` }))}
            size={4}
            labels={({ datum }) => datum.label}
            labelComponent={<VictoryTooltip flyoutStyle={{ fill: '#eee' }} />}
          />
        </VictoryChart>
      </ViewShot>

      <Button title={t.export} onPress={saveChart} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { marginBottom: 20, fontStyle: 'italic', color: '#666' },
  languageSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    flexWrap: 'wrap'
  },
  langBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: 6
  },
  activeLang: {
    backgroundColor: '#e0e0e0'
  }
});
