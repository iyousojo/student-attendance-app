import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DisplayQR() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  const qrToken = params.qrToken || sessionData?.qrToken;
  const courseCode = params.courseCode || sessionData?.courseCode;
  const backupCode = params.backupCode || sessionData?.backupCode;

  const handleClose = () => {
    if (params.fromCreate === 'true') {
      router.replace('/(tabs)/home');
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (!params.sessionId) return;

    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await axios.get(
          `https://studentattendanceapi-v4hq.onrender.com/api/attendance/session-details/${params.sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setAttendeeCount(res.data.attendees?.length || 0);
          setSessionData(res.data.session);
        }
      } catch (e) {
        console.error("Fetch Error:", e.message);
      } finally {
        setFetching(false);
      }
    };

    fetchDetails();
    const interval = setInterval(fetchDetails, 5000); 
    return () => clearInterval(interval);
  }, [params.sessionId]);

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F19]">
      <StatusBar style="light" />
      
      {/* TOP NAVIGATION BAR */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/5 bg-[#0B0F19]">
        <TouchableOpacity 
          onPress={handleClose} 
          className="w-10 h-10 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700"
        >
          <Feather name="x" size={20} color="white" />
        </TouchableOpacity>
        
        <View className="items-center">
            <Text className="text-white font-bold text-sm tracking-widest uppercase">{courseCode || "Live Session"}</Text>
            <View className="flex-row items-center mt-0.5">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-emerald-500 font-bold text-[9px] uppercase tracking-[2px]">Broadcasting</Text>
            </View>
        </View>

        <TouchableOpacity 
          onPress={() => Share.share({ message: `Secure Attendance for ${courseCode}.\nCode: ${backupCode}` })} 
          className="w-10 h-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <Feather name="share-2" size={18} color="#fbbf24" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40 }}>
        
        {/* ATTENDEE HUB CARD */}
        <View className="bg-[#161B26] w-full p-8 rounded-[40px] items-center mb-8 border border-slate-800 relative overflow-hidden">
          {/* Subtle background glow */}
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          
          <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-[4px] mb-2">Total Check-ins</Text>
          <View className="flex-row items-center">
            <Text className="text-white text-8xl font-light tracking-tighter">{attendeeCount}</Text>
            {fetching && <ActivityIndicator size="small" color="#fbbf24" className="ml-4" />}
          </View>
          
          <View className="mt-4 flex-row space-x-2">
            <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Text className="text-emerald-500 font-bold text-[10px] uppercase">Receiving Data</Text>
            </View>
          </View>
        </View>

        {/* QR SCAN ZONE */}
        <View className="items-center">
          <View className="bg-white p-6 rounded-[48px] border-[12px] border-[#161B26] shadow-2xl">
            {qrToken ? (
              <QRCode 
                value={qrToken} 
                size={200} 
                color="#0B0F19" 
                backgroundColor="white" 
                quietZone={8} 
              />
            ) : (
              <View className="w-[200px] h-[200px] items-center justify-center">
                  <ActivityIndicator size="large" color="#fbbf24" />
              </View>
            )}
          </View>
          <Text className="text-slate-500 font-medium text-[11px] mt-6 tracking-[1px]">Instruct students to scan from within 200m</Text>
        </View>

        {/* SECURE BACKUP PROTOCOL */}
        {backupCode && (
          <View className="mt-10 bg-amber-500/5 border border-amber-500/10 rounded-3xl p-5 items-center">
            <View className="flex-row items-center mb-2">
              <Feather name="shield" size={12} color="#fbbf24" />
              <Text className="text-amber-500 font-bold text-[10px] uppercase tracking-[3px] ml-2">Manual Override Code</Text>
            </View>
            <Text className="text-white text-4xl font-black tracking-[10px] ml-[10px]">{backupCode}</Text>
          </View>
        )}

        {/* SPECS FOOTER */}
        <View className="mt-8 flex-row justify-center space-x-4">
            <View className="flex-row items-center opacity-60">
                <Feather name="clock" size={12} color="#94a3b8" />
                <Text className="text-slate-400 text-[10px] font-bold ml-2 uppercase">Limit: {params.lateAfterMins || '15'}m</Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-slate-700 mt-1.5" />
            <View className="flex-row items-center opacity-60">
                <Feather name="map" size={12} color="#94a3b8" />
                <Text className="text-slate-400 text-[10px] font-bold ml-2 uppercase">Rad: {sessionData?.radius || '200'}m</Text>
            </View>
        </View>

      </ScrollView>

      {/* PRIMARY ACTION BAR */}
      <View className="px-8 pb-10">
        <TouchableOpacity 
          onPress={() => router.push({ pathname: "/attendance/session-details", params: { sessionId: params.sessionId } })}
          activeOpacity={0.9}
          className="bg-white h-16 rounded-2xl items-center justify-center flex-row shadow-2xl shadow-white/10"
        >
          <Feather name="list" size={18} color="#0B0F19" />
          <Text className="text-[#0B0F19] font-black text-sm uppercase tracking-[2px] ml-3">Manage Session Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}