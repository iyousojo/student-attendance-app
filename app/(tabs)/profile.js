import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Loading...', email: '', role: '' });

  // THEME CONSTANTS
  const bgMain = "#F5F2F0";

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem("userData");
        if (data) {
          setUser(JSON.parse(data));
        }
      } catch (e) {
        console.error("Failed to load user data");
      }
    };
    loadUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Terminate Session",
      "Are you sure you want to log out of the secure portal?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove(["userData", "userToken"]);
            router.replace("/(auth)/login");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: bgMain }} className="flex-1">
      <StatusBar style="dark" />
      <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* Header / Avatar Section */}
        <View className="items-center mb-10">
          <View className="w-28 h-28 rounded-[40px] bg-white border border-stone-200 items-center justify-center mb-5 shadow-xl shadow-stone-300">
            <View className="bg-stone-100 p-5 rounded-[30px]">
              <Feather name="user" size={44} color="#444" />
            </View>
            <View className="absolute -bottom-1 -right-1 bg-emerald-500 w-8 h-8 rounded-full border-4 border-[#F5F2F0] items-center justify-center">
               <View className="w-2 h-2 bg-white rounded-full" />
            </View>
          </View>
          <Text className="text-stone-900 text-3xl font-black tracking-tight">{user.name}</Text>
          <View className="bg-stone-900 px-4 py-1 rounded-full mt-2">
            <Text className="text-white text-[10px] font-black uppercase tracking-[2px]">{user.role}</Text>
          </View>
        </View>

        {/* Credentials Card */}
        <Text className="text-stone-400 font-bold text-[10px] uppercase tracking-[2px] mb-3 ml-1">Identity Verification</Text>
        <View className="bg-white rounded-[32px] p-6 border border-stone-200 shadow-sm mb-8">
          <View className="flex-row items-center mb-6">
            <View className="bg-stone-50 p-3 rounded-2xl mr-4 border border-stone-100">
              <Feather name="mail" size={20} color="#78716C" />
            </View>
            <View className="flex-1">
              <Text className="text-stone-400 text-[9px] uppercase font-black tracking-widest">Registered Email</Text>
              <Text className="text-stone-900 font-bold text-base" numberOfLines={1}>{user.email}</Text>
            </View>
          </View>

          <View className="h-[1px] bg-stone-100 mb-6" />

          <View className="flex-row items-center">
            <View className="bg-emerald-50 p-3 rounded-2xl mr-4 border border-emerald-100">
              <Feather name="shield" size={20} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-stone-400 text-[9px] uppercase font-black tracking-widest">Protocol Status</Text>
              <Text className="text-emerald-600 font-bold text-base">Triple-Lock Verified</Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <Text className="text-stone-400 font-bold text-[10px] uppercase tracking-[2px] mb-3 ml-1">Account Security</Text>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/history")}
          className="bg-white flex-row items-center justify-between p-5 rounded-2xl border border-stone-200 mb-3"
        >
          <View className="flex-row items-center">
            <Feather name="clock" size={20} color="#78716C" />
            <Text className="text-stone-700 ml-4 font-bold">Access Logs</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#D6D3D1" />
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={handleLogout}
          className="bg-rose-50 flex-row items-center justify-between p-5 rounded-2xl border border-rose-100 mt-2"
        >
          <View className="flex-row items-center">
            <Feather name="log-out" size={20} color="#e11d48" />
            <Text className="text-rose-600 ml-4 font-bold">Terminate Session</Text>
          </View>
          <Feather name="power" size={16} color="#fda4af" />
        </TouchableOpacity>

        <View className="mt-12 items-center">
            <Text className="text-stone-300 text-center text-[9px] font-black tracking-[4px] uppercase">
                Secure System v1.0.4
            </Text>
            <View className="w-1 h-1 bg-stone-300 rounded-full mt-2" />
        </View>
        
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}