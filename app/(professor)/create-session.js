import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateSession() {
  const router = useRouter();
  
  const [courseCode, setCourseCode] = useState('');
  const [durationMins, setDurationMins] = useState('60');
  const [lateAfterMins, setLateAfterMins] = useState('15');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // THEME CONSTANTS
  const bgMain = "#F5F2F0";
  const FIXED_RADIUS = 200; 
  const IDEAL_ACCURACY = 20; 

  const getGPSLock = async () => {
    setRefreshing(true);
    try {
      const freshLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation(freshLoc.coords);
    } catch (e) {
      Alert.alert("GPS Error", "Failed to sync. Ensure Location Services are ON.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let watcher;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, distanceInterval: 1, timeInterval: 1000 },
        (newLocation) => setLocation(newLocation.coords)
      );
    })();
    return () => watcher?.remove();
  }, []);

  const handleStartSession = async () => {
    if (!courseCode) return Alert.alert('Required', 'Please input a valid Course Code.');
    if (!location) return Alert.alert("No GPS Lock", "Please wait for a GPS signal.");

    if (isAccuracyLow) {
      Alert.alert(
        "Low Accuracy Detected",
        "The current GPS signal is weak. Proceeding may cause geofencing issues.",
        [
          { text: "Wait for Signal", style: "cancel" },
          { text: "Proceed Anyway", onPress: () => processDeployment() }
        ]
      );
    } else {
      processDeployment();
    }
  };

  const processDeployment = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const sessionData = {
        courseCode: courseCode.trim().toUpperCase(),
        lat: location?.latitude,
        lng: location?.longitude,
        radius: FIXED_RADIUS,
        durationMins: parseInt(durationMins),
        lateAfterMins: parseInt(lateAfterMins),
        generateBackup: true 
      };

      const response = await axios.post(
        'https://studentattendanceapi-v4hq.onrender.com/api/attendance/session',
        sessionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        router.push({
          pathname: '/attendance/display-qr',
          params: {
            sessionId: response.data.data._id,
            qrToken: response.data.data.qrToken,
            backupCode: response.data.data.backupCode,
            courseCode: sessionData.courseCode,
            fromCreate: 'true'
          },
        });
      }
    } catch (err) {
      Alert.alert('Deployment Error', err.response?.data?.message || 'Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const isAccuracyLow = !location || location.accuracy > IDEAL_ACCURACY;

  return (
    <SafeAreaView style={{ backgroundColor: bgMain }} className="flex-1">
      <StatusBar style="dark" />
      
      {/* STATUS BAR TOP */}
      <View className={`px-6 py-3 flex-row items-center justify-between ${isAccuracyLow ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
        <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-3 ${isAccuracyLow ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <Text className={`font-bold text-[10px] uppercase tracking-[2px] ${isAccuracyLow ? 'text-rose-600' : 'text-emerald-700'}`}>
              {isAccuracyLow ? 'Signal Status: Low Precision' : 'Signal Status: High Precision'}
            </Text>
        </View>
        {isAccuracyLow && <Feather name="alert-circle" size={14} color="#e11d48" />}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 px-8">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity onPress={() => router.back()} className="mt-6 w-10 h-10 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-sm">
            <Feather name="arrow-left" size={20} color="#444" />
          </TouchableOpacity>

          <Text className="text-3xl font-black text-stone-900 mt-8 tracking-tight">Initialize Session</Text>
          <Text className="text-stone-500 font-medium mt-1 leading-5">200m Geofencing and timing protocol active.</Text>

          <View className="mt-10">
            {/* COURSE CODE INPUT */}
            <View className="mb-6">
              <Text className="text-stone-400 font-bold text-[10px] uppercase tracking-[1.5px] mb-3 ml-1">Course Identification</Text>
              <View className="bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm">
                <TextInput
                  placeholder="E.G. CSC 401"
                  placeholderTextColor="#A8A29E"
                  className="text-xl font-bold text-stone-900 uppercase"
                  value={courseCode}
                  onChangeText={setCourseCode}
                />
              </View>
            </View>

            {/* DURATION & MARGIN */}
            <View className="flex-row space-x-4 mb-6">
              <View className="flex-1">
                <Text className="text-stone-400 font-bold text-[10px] uppercase tracking-[1.5px] mb-3 ml-1">Duration</Text>
                <View className="bg-white border border-stone-200 rounded-2xl px-5 py-4 flex-row items-center shadow-sm">
                  <TextInput
                    keyboardType="numeric"
                    className="text-lg font-bold text-stone-900 flex-1"
                    value={durationMins}
                    onChangeText={setDurationMins}
                  />
                  <Text className="text-stone-400 font-bold text-[10px] ml-2">MIN</Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-stone-400 font-bold text-[10px] uppercase tracking-[1.5px] mb-3 ml-1">Late Margin</Text>
                <View className="bg-white border border-stone-200 rounded-2xl px-5 py-4 flex-row items-center shadow-sm">
                  <TextInput
                    keyboardType="numeric"
                    className="text-lg font-bold text-stone-900 flex-1"
                    value={lateAfterMins}
                    onChangeText={setLateAfterMins}
                  />
                  <Text className="text-stone-400 font-bold text-[10px] ml-2">MIN</Text>
                </View>
              </View>
            </View>

            {/* GPS PRECISION CARD */}
            <View className={`border rounded-[32px] p-6 shadow-xl shadow-stone-200/50 bg-white ${isAccuracyLow ? 'border-rose-200' : 'border-stone-100'}`}>
              <View className="flex-row justify-between items-start mb-6">
                <View>
                  <Text className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mb-1">Precision Reading</Text>
                  <Text className={`text-3xl font-light ${isAccuracyLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {location ? `±${location.accuracy.toFixed(1)}m` : 'Syncing...'}
                  </Text>
                </View>
                <TouchableOpacity onPress={getGPSLock} disabled={refreshing} className="bg-stone-50 w-10 h-10 rounded-xl items-center justify-center border border-stone-200 shadow-sm">
                  {refreshing ? <ActivityIndicator size="small" color="#444" /> : <Feather name="refresh-ccw" size={16} color="#444" />}
                </TouchableOpacity>
              </View>

              <View className={`mb-2 p-3 rounded-xl flex-row items-center ${isAccuracyLow ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                <Feather name={isAccuracyLow ? "zap-off" : "zap"} size={14} color={isAccuracyLow ? "#e11d48" : "#059669"} />
                <Text className={`ml-3 text-[11px] font-bold ${isAccuracyLow ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {isAccuracyLow ? "UNSTABLE: High probability of scan failure." : "STABLE: GPS lock highly reliable."}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleStartSession}
          disabled={loading}
          activeOpacity={0.8}
          className={`mb-10 h-16 rounded-2xl items-center justify-center flex-row shadow-2xl ${loading ? 'bg-stone-200' : 'bg-stone-900'}`}
        >
          {loading ? <ActivityIndicator color="#444" /> : (
            <>
              <Text className="text-white font-black text-sm uppercase tracking-[3px]">Deploy Session</Text>
              <View className="ml-3 bg-white w-6 h-6 rounded-full items-center justify-center">
                <Feather name="chevron-right" size={14} color="#1C1917" />
              </View>
            </>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}