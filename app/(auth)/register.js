import { Feather } from "@expo/vector-icons";
import axios from "axios";
import * as Application from 'expo-application';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");
  const [deviceId, setDeviceId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const syncID = async () => {
      let id = Platform.OS === 'android' ? Application.androidId : await Application.getIosIdForVendorAsync();
      const cleanId = id ? id.toUpperCase().trim() : `SIM-${Platform.OS.toUpperCase()}`;
      setDeviceId(`MOB-${cleanId}`);
    };
    syncID();
  }, []);

  const handleRegister = async () => {
    const { name, email, password } = form;
    if (!name || !email || !password) {
      Alert.alert("Access Denied", "System requires all credentials to bind hardware.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://studentattendanceapi-v4hq.onrender.com/api/auth/register", {
        ...form,
        email: email.toLowerCase().trim(),
        role,
        deviceId, 
      });

      if (response.data.success) {
        Alert.alert("Identity Verified", "Hardware binding sequence complete.", [
          { text: "ENTER TERMINAL", onPress: () => router.push("/login") }
        ]);
      }
    } catch (error) {
      Alert.alert("Encryption Error", error.response?.data?.message || "Protocol failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0C0A09' }}>
      <StatusBar style="light" />
      <LinearGradient 
        colors={["rgba(217, 119, 6, 0.05)", "transparent"]} 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400 }} 
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 28, paddingVertical: 20 }}
          >
            {/* Header Section */}
            <View className="flex-row justify-between items-center mb-10">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-12 h-12 items-center justify-center rounded-2xl bg-stone-900 border border-stone-800"
              >
                <Feather name="chevron-left" size={24} color="#D97706" />
              </TouchableOpacity>
              <View className="items-end">
                <Text className="text-stone-500 font-black text-[10px] uppercase tracking-[3px]">Node ID</Text>
                <Text className="text-amber-600 font-bold text-[12px]">{deviceId?.substring(0, 15) || "Scanning..."}</Text>
              </View>
            </View>

            <Text className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none mb-2">
              Enroll<Text className="text-amber-600">ment</Text>
            </Text>
            <Text className="text-stone-500 mb-10 font-bold text-[11px] uppercase tracking-[4px]">
              System Hardware Binding Active
            </Text>

            {/* Role Switcher */}
            <View className="bg-stone-900/50 p-1.5 rounded-[24px] flex-row mb-8 border border-stone-800">
              {["student", "professor"].map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  className={`flex-1 py-4 rounded-[20px] items-center ${role === r ? "bg-amber-600" : ""}`}
                >
                  <Text className={`font-black text-[11px] uppercase tracking-widest ${role === r ? "text-white" : "text-stone-500"}`}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Fields */}
            <View className="space-y-6">
              <View>
                <Text className="text-stone-500 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">Legal Identity</Text>
                <View className="flex-row items-center bg-stone-900 border border-stone-800 rounded-2xl px-4 py-1">
                  <Feather name="user" size={18} color="#57534E" />
                  <TextInput 
                    placeholder="Full Name" 
                    placeholderTextColor="#57534E"
                    className="flex-1 p-4 text-white font-bold" 
                    onChangeText={(v) => setForm({...form, name: v})} 
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-500 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">Secure Email</Text>
                <View className="flex-row items-center bg-stone-900 border border-stone-800 rounded-2xl px-4 py-1">
                  <Feather name="mail" size={18} color="#57534E" />
                  <TextInput 
                    placeholder="name@university.edu" 
                    placeholderTextColor="#57534E"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 p-4 text-white font-bold" 
                    onChangeText={(v) => setForm({...form, email: v})} 
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-500 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">Cipher Key</Text>
                <View className="flex-row items-center bg-stone-900 border border-stone-800 rounded-2xl px-4 py-1">
                  <Feather name="lock" size={18} color="#57534E" />
                  <TextInput 
                    placeholder="••••••••" 
                    placeholderTextColor="#57534E"
                    secureTextEntry 
                    className="flex-1 p-4 text-white font-bold" 
                    onChangeText={(v) => setForm({...form, password: v})} 
                  />
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleRegister} 
              disabled={loading} 
              activeOpacity={0.8}
              className={`rounded-[24px] py-6 mt-12 shadow-2xl flex-row justify-center items-center ${loading ? "bg-stone-800" : "bg-white"}`}
            >
              {loading ? <ActivityIndicator color="#D97706" /> : (
                <>
                  <Text className="text-black text-xs font-black uppercase tracking-[4px] mr-2">Initialize Binding</Text>
                  <Feather name="shield" size={18} color="#D97706" />
                </>
              )}
            </TouchableOpacity>

            <Text className="text-stone-600 text-center mt-8 text-[9px] uppercase tracking-[2px] font-bold">
              Restricted Access • Encrypted Tunnel v4.2
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}