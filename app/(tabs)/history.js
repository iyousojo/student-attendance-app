import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function History() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // THEME CONSTANTS
  const bgMain = "#F5F2F0";
  const cardBg = "#FFFFFF";

  const fetchFullHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const storedUserData = await AsyncStorage.getItem("userData");
      const parsedData = storedUserData ? JSON.parse(storedUserData) : null;
      const role = parsedData?.role || (await AsyncStorage.getItem("userType"));

      const endpoint = role === 'professor' 
        ? "https://studentattendanceapi-v4hq.onrender.com/api/attendance/professor/sessions"
        : "https://studentattendanceapi-v4hq.onrender.com/api/auth/profile";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        let rawData = [];
        if (role === 'professor') {
          rawData = response.data.sessions || response.data.data || [];
        } else {
          rawData = response.data.attendanceHistory || response.data.user?.attendanceHistory || [];
        }

        const sortedHistory = [...rawData].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        
        setHistory(sortedHistory);
      }
    } catch (err) {
      console.error("History Fetch Error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFullHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFullHistory();
  };

  if (loading) {
    return (
      <View style={{ backgroundColor: bgMain }} className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#d97706" />
        <Text className="mt-4 text-stone-400 font-bold uppercase text-[10px] tracking-widest">Accessing Records...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: bgMain }} className="flex-1" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 pt-4 pb-4 flex-row justify-between items-end">
        <View>
          <Text className="text-3xl font-black text-stone-900">Archives</Text>
          <Text className="text-stone-500 font-medium">Class session history</Text>
        </View>
        <View className="bg-stone-900 px-3 py-1 rounded-full mb-1">
          <Text className="text-white font-black text-[10px] uppercase tracking-tighter">{history.length} Logs</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d97706" />}
      >
        {history.length > 0 ? (
          history.map((item, index) => {
            const dateObj = new Date(item.createdAt || Date.now());
            const expiresObj = new Date(item.expiresAt || 0);
            const isExpired = new Date() > expiresObj;
            const courseTitle = item.courseCode || item.sessionId?.courseCode || "Unknown Course";
            
            return (
              <TouchableOpacity 
                key={item._id || index} 
                activeOpacity={0.7}
                onPress={() => router.push({
                  pathname: "/attendance/session-details",
                  params: { sessionId: item._id || item.sessionId?._id } // Fixed param key to sessionId for consistency
                })}
                className="bg-white p-5 rounded-[32px] border border-stone-200 mb-4 flex-row items-center shadow-sm shadow-stone-300"
              >
                <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${isExpired ? 'bg-stone-50 border-stone-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <Feather name={isExpired ? "archive" : "zap"} size={20} color={isExpired ? "#a8a29e" : "#059669"} />
                </View>
                
                <View className="ml-4 flex-1">
                  <Text className="text-stone-900 font-black text-base uppercase">
                    {courseTitle}
                  </Text>
                  
                  <View className="flex-row items-center mt-0.5">
                    <Text className="text-stone-400 font-bold text-[11px]">
                      {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text className="text-stone-300 mx-2 text-xs">•</Text>
                    <Text className="text-stone-400 font-bold text-[11px]">
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>

                <View className={`px-3 py-1 rounded-full ${isExpired ? 'bg-stone-100' : 'bg-emerald-100'}`}>
                    <Text className={`text-[9px] font-black uppercase ${isExpired ? 'text-stone-400' : 'text-emerald-600'}`}>
                        {isExpired ? 'Closed' : 'Active'}
                    </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-stone-200/50 p-8 rounded-full">
                <Feather name="layers" size={60} color="#a8a29e" />
            </View>
            <Text className="text-stone-900 font-black text-xl mt-6">No Records Found</Text>
            <Text className="text-stone-500 text-center mt-2 px-10 leading-5">
                Sessions you create or join will appear in this archive. Pull down to sync data.
            </Text>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}