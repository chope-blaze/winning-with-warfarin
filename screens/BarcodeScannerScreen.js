import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';

export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const requestPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert('Barcode Scanned', `Type: ${type}\nData: ${data}`);
    // Example: Send `data` to OpenFoodFacts or Spoonacular here
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No access to camera</Text>
        <Button title="Allow Camera" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {scanned && (
        <View style={styles.buttonContainer}>
          <View style={styles.buttonSpacing}>
            <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
          </View>
          <View style={styles.buttonSpacing}>
            <Button title="Back to Food Screen" onPress={() => navigation.goBack()} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonSpacing: {
    marginVertical: 8,
  },
});
