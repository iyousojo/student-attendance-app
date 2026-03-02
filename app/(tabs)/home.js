import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dataList, setDataList] = useState([]); 
  const [stats, setStats] = useState({ primary: 0, secondary: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Brownish-White Theme Constants
  const bgMain = "#F5F2F0"; // The brownish-white background
  const cardBg = "#FFFFFF";

  const loadDashboardData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const token = await AsyncStorage.getItem("userToken");
      const parsedUser = JSON.parse(userData);
      if (parsedUser) setUser(parsedUser);

      const isProf = parsedUser?.role === 'professor';
      const endpoint = isProf 
        ? "/api/attendance/professor/sessions" 
        : "/api/auth/profile";

      const response = await axios.get(`https://studentattendanceapi-v4hq.onrender.com${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        if (isProf) {
          const sessions = response.data.sessions || [];
          setDataList(sessions);
          setStats({ primary: sessions.length, secondary: 0 });
        } else {
          const history = response.data.attendanceHistory || [];
          setDataList(history);
          setStats({ 
            primary: response.data.attendedCount || 0, 
            secondary: response.data.lateCount || 0 
          });
        }
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading && !user) {
    return (
      <View style={{ backgroundColor: bgMain }} className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  const isProfessor = user?.role === 'professor';
  const recentData = [...dataList]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <SafeAreaView style={{ backgroundColor: bgMain }} className="flex-1">
      <StatusBar style="dark" />
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d97706" />}
      >
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-6">
          <View>
            <Text className="text-stone-500 font-bold uppercase text-[10px] tracking-[3px]">Authorized Access</Text>
            <Text className="text-3xl font-black text-stone-900">{user?.name?.split(" ")[0] || "User"} 👋</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push("/profile")} 
            className="bg-white h-12 w-12 rounded-2xl items-center justify-center border border-stone-200 shadow-sm overflow-hidden"
          >
             {user?.profileImage ? (
               <Image source={{ uri: user.profileImage }} className="h-full w-full" />
             ) : (
               <Text className="text-amber-600 font-bold text-lg">{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
             )}
          </TouchableOpacity>
        </View>

        {/* Security Status Card */}
        <LinearGradient 
          colors={["#FFFFFF", "#F9F7F5"]} 
          className="mt-8 p-6 rounded-[32px] border border-stone-200 shadow-xl shadow-stone-200/50"
        >
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-amber-600 font-bold uppercase text-[10px] tracking-[2px]">Protocol Status</Text>
              <Text className="text-stone-900 text-2xl font-black mt-1">Triple-Lock Active</Text>
              <Text className="text-stone-500 text-xs font-medium mt-1 italic">Identity • Time • Geofence</Text>
            </View>
            <View className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
              <Feather name="shield" size={20} color="#d97706" />
            </View>
          </View>
          <View className="h-[1px] bg-stone-100 my-5" />
          <View className="flex-row justify-between">
            <View>
              <Text className="text-stone-400 text-[9px] uppercase font-black tracking-widest">Active Role</Text>
              <Text className="text-stone-800 font-bold capitalize text-sm">{user?.role || "Student"}</Text>
            </View>
            <View className="items-end">
              <Text className="text-stone-400 text-[9px] uppercase font-black tracking-widest">Connection</Text>
              <Text className="text-emerald-600 font-bold text-sm">Encrypted</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Statistics Grid */}
        <View className="mt-8">
          <Text className="text-stone-900 text-lg font-black mb-4 tracking-tight">System Overview</Text>
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-white w-[48%] p-5 rounded-3xl mb-4 border border-stone-200 shadow-sm">
              <View className="bg-blue-500/10 w-10 h-10 rounded-xl items-center justify-center mb-4 border border-blue-500/20">
                <Feather name={isProfessor ? "layers" : "calendar"} size={18} color="#2563eb" />
              </View>
              <Text className="text-stone-400 text-[9px] font-black uppercase tracking-widest">
                {isProfessor ? "Total Sessions" : "Total Attended"}
              </Text>
              <Text className="text-2xl font-light text-stone-900 mt-1">{stats.primary}</Text>
            </View>

            {!isProfessor && (
              <View className="bg-white w-[48%] p-5 rounded-3xl mb-4 border border-stone-200 shadow-sm">
                <View className="bg-amber-500/10 w-10 h-10 rounded-xl items-center justify-center mb-4 border border-amber-500/20">
                  <Feather name="clock" size={18} color="#d97706" />
                </View> 
                <Text className="text-stone-400 text-[9px] font-black uppercase tracking-widest">Late Entries</Text>
                <Text className="text-2xl font-light text-stone-900 mt-1">{stats.secondary}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-stone-900 text-lg font-black tracking-tight">
            {isProfessor ? "Recent Deployments" : "Recent Logins"}
          </Text>
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/history")}
            className="bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm"
          >
            <Text className="text-stone-500 font-bold text-[10px] uppercase tracking-widest">Full History</Text>
          </TouchableOpacity>
        </View>

        {recentData.length > 0 ? (
          recentData.map((item, index) => (
            <TouchableOpacity 
              key={item._id || index} 
              onPress={() => isProfessor && router.push(`/attendance/session-details?sessionId=${item._id}`)}
              className="bg-white p-4 rounded-2xl border border-stone-200 mb-3 flex-row items-center shadow-sm"
            >
              <View className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <Feather name={isProfessor ? "users" : "check-circle"} size={18} color={isProfessor ? "#444" : "#059669"} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-stone-900 font-bold text-sm">
                  {isProfessor ? item.courseCode : item.sessionId?.courseCode || "Class Session"}
                </Text>
                <Text className="text-stone-400 text-[10px] font-medium mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              {isProfessor ? (
                <Feather name="chevron-right" size={18} color="#a8a29e" />
              ) : (
                <View className={`px-2 py-1 rounded-md ${item.status === 'present' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                  <Text className={`text-[9px] font-black uppercase ${item.status === 'present' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {item.status}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-white py-10 rounded-[32px] border border-dashed border-stone-200 items-center">
            <Feather name="activity" size={32} color="#d6d3d1" />
            <Text className="text-stone-400 mt-2 font-bold text-[10px] uppercase tracking-widest">Data Stream Empty</Text>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}