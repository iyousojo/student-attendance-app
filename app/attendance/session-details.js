import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SessionDetails() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams(); 
  
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null); 
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchAttendees = async (isAutoRefresh = false) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await axios.get(
        `https://studentattendanceapi-v4hq.onrender.com/api/attendance/session-details/${sessionId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setAttendees(res.data.attendees || []);
        setSessionInfo(res.data.session);
      }
    } catch (e) { 
      // Only show alerts on manual refresh or initial load to avoid spamming the user
      if (!isAutoRefresh) {
        console.error("Fetch error:", e); 
        Alert.alert("Sync Error", "Could not reach the secure server.");
      }
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  // Initial Load and Auto-Refresh Logic
  useEffect(() => { 
    if (sessionId) {
      fetchAttendees();

      // Start Polling: Fetch data every 5 seconds
      const interval = setInterval(() => {
        fetchAttendees(true);
      }, 5000);

      // Cleanup: Stop polling when the user leaves the screen
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      Alert.alert("Error", "No Session ID provided.");
    }
  }, [sessionId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendees();
  };

  const handleExport = async () => {
    if (!attendees || attendees.length === 0) {
      return Alert.alert("Export Error", "No data available to generate CSV.");
    }
    try {
      const csv = "Name,Email,Time,Status\n" + attendees.map(a => 
        `${a.studentId?.name || 'Unknown'},${a.studentId?.email || 'N/A'},${new Date(a.createdAt).toLocaleTimeString()},${a.status}`
      ).join("\n");
      
      const path = `${FileSystem.documentDirectory}Attendance_${sessionId.slice(-4)}.csv`;
      await FileSystem.writeAsStringAsync(path, csv);
      await Sharing.shareAsync(path);
    } catch (error) {
      Alert.alert("System Error", "Failed to generate export file.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0F19]">
      <StatusBar style="light" />
      
      {/* HEADER */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/5">
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/home")} 
          className="w-10 h-10 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700"
        >
          <Feather name="home" size={20} color="white" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-white font-bold text-lg tracking-tight">Live Attendee Log</Text>
          <View className="flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-emerald-500 font-bold text-[9px] uppercase tracking-widest">
                {sessionInfo?.courseCode || 'Syncing...'}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleExport} className="w-10 h-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Feather name="download" size={18} color="#10b981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fbbf24" />
          <Text className="text-slate-500 mt-4 font-bold text-[10px] uppercase tracking-widest">establishing link...</Text>
        </View>
      ) : (
        <FlatList
          data={attendees}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fbbf24" />
          }
          contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
          ListEmptyComponent={
            <View className="items-center mt-20 opacity-50">
               <View className="bg-slate-800/50 p-8 rounded-full mb-4 border border-slate-700">
                 <Feather name="users" size={40} color="#475569" />
               </View>
               <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-[2px]">Awaiting First Connection...</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => { setSelectedStudent(item); setIsModalVisible(true); }}
              className="bg-[#161B26] p-4 rounded-2xl mb-3 flex-row items-center border border-slate-800"
            >
              <View className="h-10 w-10 rounded-xl bg-slate-800 items-center justify-center border border-slate-700">
                <Text className="text-white font-black">{item.studentId?.name?.charAt(0) || '?'}</Text>
              </View>
              
              <View className="ml-4 flex-1">
                <Text className="font-bold text-white text-sm">{item.studentId?.name || "Anonymous"}</Text>
                <Text className="text-[10px] text-slate-500 uppercase tracking-tighter">{new Date(item.createdAt).toLocaleTimeString()}</Text>
              </View>

              <View className={`px-3 py-1 rounded-lg border ${item.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <Text className={`font-black uppercase text-[9px] ${item.status === 'present' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* DETAIL OVERLAY */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <Pressable className="flex-1 bg-black/80 justify-end" onPress={() => setIsModalVisible(false)}>
          <Pressable className="bg-[#161B26] rounded-t-[40px] p-8 border-t border-slate-800">
            <View className="w-12 h-1 bg-slate-800 rounded-full self-center mb-8" />
            
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-3xl bg-slate-800 items-center justify-center mb-4 border border-slate-700">
                <Text className="text-white text-3xl font-black">{selectedStudent?.studentId?.name?.charAt(0)}</Text>
              </View>
              <Text className="text-2xl font-black text-white">{selectedStudent?.studentId?.name}</Text>
              <Text className="text-slate-500 font-medium mt-1">{selectedStudent?.studentId?.email}</Text>
            </View>

            <View className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
                <View className="flex-row justify-between mb-4">
                    <Text className="text-slate-500 font-bold text-[10px] uppercase">Method</Text>
                    <Text className="text-white font-bold uppercase text-[10px]">{selectedStudent?.method || 'Direct Scan'}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-slate-500 font-bold text-[10px] uppercase">Verification</Text>
                    <Text className="text-emerald-500 font-bold uppercase text-[10px]">Verified GPS</Text>
                </View>
            </View>

            <TouchableOpacity onPress={() => setIsModalVisible(false)} className="mt-8 bg-white h-14 rounded-2xl items-center justify-center">
              <Text className="text-[#0B0F19] font-black uppercase tracking-widest">Return to List</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* FLOATING ACTION: SHOW QR */}
      <View className="absolute bottom-10 left-0 right-0 items-center px-10">
        <TouchableOpacity 
          onPress={() => {
            router.push({
              pathname: "/attendance/display-qr",
              params: { 
                sessionId: sessionId, 
                qrToken: sessionInfo?.qrToken || "", 
                courseCode: sessionInfo?.courseCode || "SESSION",
                backupCode: sessionInfo?.backupCode || ""
              }
            });
          }} 
          activeOpacity={0.9}
          className="bg-white w-full h-16 rounded-2xl flex-row items-center justify-center shadow-2xl shadow-white/10"
        >
          <Feather name="maximize" size={18} color="#0B0F19" />
          <Text className="text-[#0B0F19] font-black text-sm ml-3 uppercase tracking-[2px]">Toggle QR Display</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}