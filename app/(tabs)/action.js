import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ActionScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const MIN_ACCURACY_METERS = 50;
  const accentAmber = "#D97706";
  const bgMain = "#F5F2F0";

  useEffect(() => {
    async function init() {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsed = JSON.parse(userData);
          setRole(parsed.role);
        }
        await Location.requestForegroundPermissionsAsync();
      } catch (e) {
        console.error("Init Error:", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const getFreshLocation = async () => {
    await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      timeout: 10000
    });
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || verifying) return;
    setScanned(true);
    setVerifying(true);

    try {
      const loc = await getFreshLocation();

      if (loc.coords.accuracy && loc.coords.accuracy > MIN_ACCURACY_METERS) {
        Alert.alert(
          "Poor GPS Precision",
          `Accuracy: ±${loc.coords.accuracy.toFixed(1)}m. Protocol requires higher precision.`,
          [
            { text: "Use Backup Code", onPress: () => setManualModalVisible(true) },
            { text: "Try Again", onPress: () => { setScanned(false); setVerifying(false); } }
          ]
        );
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        "https://studentattendanceapi-v4hq.onrender.com/api/attendance/scan",
        {
          qrToken: data,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy: loc.coords.accuracy ?? null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert("Identity Confirmed", "Attendance has been logged in the secure ledger.", [
          { text: "Done", onPress: () => router.replace("/(tabs)/home") }
        ]);
      }
    } catch (err) {
      Alert.alert("Verification Failed", err.response?.data?.message || "Server rejected session token.", [
        { text: "Retry", onPress: () => { setScanned(false); setVerifying(false); } }
      ]);
    } finally {
      setVerifying(false);
    }
  };

  const submitManualCode = async () => {
    if (!manualCode.trim()) return Alert.alert("Input Required", "Enter the 6-digit backup sequence.");
    
    setManualSubmitting(true);
    try {
      const loc = await getFreshLocation();
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.post(
        "https://studentattendanceapi-v4hq.onrender.com/api/attendance/manual",
        {
          code: manualCode.trim(),
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy: loc.coords.accuracy ?? null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setManualModalVisible(false);
        Alert.alert("Success", "Manual entry verified.", [
          { text: "Done", onPress: () => router.replace("/(tabs)/home") }
        ]);
      }
    } catch (err) {
      Alert.alert("Authorization Failed", err.response?.data?.message || "Invalid sequence.");
    } finally {
      setManualSubmitting(false);
      setManualCode('');
      setScanned(false);
    }
  };

  if (loading) return (
    <View style={{ backgroundColor: bgMain }} className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color={accentAmber} />
    </View>
  );

  if (!permission?.granted) {
    return (
      <View style={{ backgroundColor: bgMain }} className="flex-1 justify-center items-center px-10">
        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-200 mb-6">
          <Feather name="camera-off" size={40} color="#78716C" />
        </View>
        <Text className="text-stone-900 text-xl font-black text-center">Camera Locked</Text>
        <Text className="text-stone-500 text-center mt-2 font-medium">Optical verification requires camera access.</Text>
        <TouchableOpacity 
          onPress={requestPermission} 
          className="bg-stone-900 w-full py-5 rounded-2xl mt-8 shadow-lg shadow-stone-400"
        >
          <Text className="text-white text-center font-black uppercase tracking-widest text-xs">Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // PROFESSOR VIEW
  if (role === 'professor') {
    return (
      <SafeAreaView style={{ backgroundColor: bgMain }} className="flex-1 justify-center px-8">
        <View className="bg-white p-10 rounded-[40px] items-center border border-stone-200 shadow-xl shadow-stone-300">
          <View className="bg-stone-50 p-6 rounded-full border border-stone-100 mb-6">
             <Feather name="plus-circle" size={50} color={accentAmber} />
          </View>
          <Text className="text-stone-900 text-3xl font-black text-center">New Session</Text>
          <Text className="text-stone-500 text-center mt-2 font-medium mb-10">
            Initialize a secure geofenced attendance window for your students.
          </Text>
          <TouchableOpacity 
            onPress={() => router.push("/(professor)/create-session")} 
            activeOpacity={0.9}
            className="bg-stone-900 w-full py-5 rounded-[24px] shadow-lg flex-row justify-center items-center"
          >
            <Text className="text-white font-black uppercase tracking-[3px] text-xs">Initialize Lock</Text>
            <Feather name="chevron-right" size={16} color="white" className="ml-2" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // STUDENT SCANNER VIEW
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeSettings={{ barcodeTypes: ["qr"] }}
      />
      
      {/* Scanner Overlay */}
      <View className="flex-1 justify-center items-center bg-black/40">
        <View style={{ width: width * 0.7, height: width * 0.7 }} className="border border-white/20 rounded-[40px]">
          <View style={[styles.corner, styles.tl, { borderColor: accentAmber }]} />
          <View style={[styles.corner, styles.tr, { borderColor: accentAmber }]} />
          <View style={[styles.corner, styles.bl, { borderColor: accentAmber }]} />
          <View style={[styles.corner, styles.br, { borderColor: accentAmber }]} />
        </View>

        <View className="bg-white/10 px-6 py-3 rounded-full mt-10 blur-sm">
           <Text className="text-white font-black uppercase tracking-widest text-[10px]">
             {verifying ? "Processing Signal..." : "Align Optical Token"}
           </Text>
        </View>

        <TouchableOpacity 
          onPress={() => setManualModalVisible(true)} 
          className="mt-8 border-b border-white/30 pb-1"
        >
          <Text className="text-white/80 font-bold tracking-tighter">
            Switch to Backup Sequence
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Input Modal */}
      <Modal
        visible={manualModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setManualModalVisible(false)}
      >
        <View className="flex-1 bg-stone-900/80 justify-end">
          <View className="bg-[#F5F2F0] rounded-t-[40px] p-8 pb-12 shadow-2xl">
            <View className="w-12 h-1.5 bg-stone-300 rounded-full self-center mb-8" />
            
            <Text className="text-stone-900 text-2xl font-black">Backup Sequence</Text>
            <Text className="text-stone-500 font-medium mt-1">
              Enter the 6-digit bypass code from the professor's display.
            </Text>

            <TextInput
              placeholder="000000"
              placeholderTextColor="#A8A29E"
              value={manualCode}
              onChangeText={setManualCode}
              keyboardType="numeric"
              maxLength={6}
              className="mt-8 bg-white rounded-3xl p-6 text-3xl font-black text-center tracking-[15px] text-stone-900 border border-stone-200 shadow-sm"
            />

            <View className="flex-row justify-between mt-10 space-x-4">
              <TouchableOpacity 
                onPress={() => setManualModalVisible(false)} 
                className="flex-1 bg-stone-200 py-5 rounded-2xl items-center"
              >
                <Text className="text-stone-600 font-black uppercase tracking-widest text-[10px]">Abort</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={submitManualCode} 
                disabled={manualSubmitting}
                style={{ backgroundColor: accentAmber }}
                className="flex-[2] py-5 rounded-2xl items-center shadow-lg shadow-amber-900/20"
              >
                {manualSubmitting ? 
                  <ActivityIndicator color="white" /> : 
                  <Text className="text-white font-black uppercase tracking-widest text-[10px]">Verify Identity</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: { position: 'absolute', width: 40, height: 40 },
  tl: { top: -2, left: -2, borderTopWidth: 6, borderLeftWidth: 6, borderTopLeftRadius: 32 },
  tr: { top: -2, right: -2, borderTopWidth: 6, borderRightWidth: 6, borderTopRightRadius: 32 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 6, borderLeftWidth: 6, borderBottomLeftRadius: 32 },
  br: { bottom: -2, right: -2, borderBottomWidth: 6, borderRightWidth: 6, borderBottomRightRadius: 32 },
});