// screens/OpenAITestScreen.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { callOpenAI } from '../helpers/openai';

export default function OpenAITestScreen() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunTest = async () => {
    setLoading(true);
    const result = await callOpenAI("Write a quick INR-friendly dinner recipe.");
    setResponse(result);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Test OpenAI API</Text>
      <Button title="Run OpenAI Test" onPress={handleRunTest} />
      {loading && <Text style={styles.loading}>Calling OpenAI...</Text>}
      <ScrollView>
        {response && (
          <Text style={styles.output}>
            {JSON.stringify(response, null, 2)}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  loading: { marginVertical: 12, fontStyle: 'italic' },
  output: { marginTop: 20, fontSize: 14, color: '#333' },
});
