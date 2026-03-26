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
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [deviceId, setDeviceId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const accentAmber = "#D97706";

  useEffect(() => {
    const syncID = async () => {
      try {
        let id = Platform.OS === 'android' ? Application.androidId : await Application.getIosIdForVendorAsync();
        const cleanId = id ? id.toUpperCase().trim() : `SIM-${Platform.OS.toUpperCase()}`;
        setDeviceId(`MOB-${cleanId}`);
      } catch (err) {
        setDeviceId("MOB-UNAVAILABLE");
      }
    };
    syncID();
  }, []);

  const handleRegister = async () => {
    const { name, email, password } = form;
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Access Denied", "System requires all credentials to bind hardware.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://studentattendanceapi-v4hq.onrender.com/api/auth/register", {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
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
    <LinearGradient colors={["#F5F2F0", "#E7E5E4"]} style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32, paddingVertical: 20 }}
          >
            
            {/* Header / ID Status */}
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-12 h-12 items-center justify-center rounded-2xl bg-white border border-stone-200 shadow-sm"
              >
                <Feather name="arrow-left" size={20} color={accentAmber} />
              </TouchableOpacity>
              <View className="items-end bg-white/80 px-4 py-2 rounded-xl border border-stone-200">
                <Text className="text-stone-400 font-black text-[8px] uppercase tracking-[2px]">Node ID</Text>
                <Text className="text-amber-600 font-bold text-[10px] tabular-nums">
                  {deviceId?.substring(0, 18) || "INITIALIZING..."}
                </Text>
              </View>
            </View>

            <View className="mb-10">
              <Text className="text-4xl font-black text-stone-900 tracking-tighter italic uppercase leading-none">
                Enroll<Text className="text-amber-600">ment</Text>
              </Text>
              <Text className="text-stone-400 mt-2 font-black text-[10px] uppercase tracking-[3px]">
                Hardware Binding Active
              </Text>
            </View>

            {/* Role Switcher - Updated for Brownish Theme */}
            <View className="bg-stone-200/50 p-1.5 rounded-[24px] flex-row mb-8 border border-stone-200">
              {["student", "professor"].map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  className={`flex-1 py-4 rounded-[20px] items-center ${role === r ? "bg-white shadow-md" : ""}`}
                >
                  <Text className={`font-black text-[10px] uppercase tracking-widest ${role === r ? "text-amber-600" : "text-stone-400"}`}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Fields */}
            <View className="space-y-5">
              <View>
                <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">Legal Identity</Text>
                <View className="bg-white rounded-2xl p-4 border border-stone-200 flex-row items-center">
                   <Feather name="user" size={16} color={form.name ? accentAmber : "#A8A29E"} style={{marginRight: 12}} />
                   <TextInput 
                    placeholder="Full Name" 
                    placeholderTextColor="#A8A29E"
                    autoCapitalize="words"
                    className="flex-1 text-stone-900 font-bold" 
                    onChangeText={(v) => setForm({...form, name: v})} 
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">Secure Email</Text>
                <View className="bg-white rounded-2xl p-4 border border-stone-200 flex-row items-center">
                   <Feather name="mail" size={16} color={form.email ? accentAmber : "#A8A29E"} style={{marginRight: 12}} />
                   <TextInput 
                    placeholder="name@university.edu" 
                    placeholderTextColor="#A8A29E"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 text-stone-900 font-bold" 
                    onChangeText={(v) => setForm({...form, email: v})} 
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">Cipher Key</Text>
                <View className="bg-white rounded-2xl p-4 border border-stone-200 flex-row items-center">
                   <Feather name="lock" size={16} color={form.password ? accentAmber : "#A8A29E"} style={{marginRight: 12}} />
                   <TextInput 
                    placeholder="••••••••" 
                    placeholderTextColor="#A8A29E"
                    secureTextEntry={!showPassword}
                    className="flex-1 text-stone-900 font-bold" 
                    onChangeText={(v) => setForm({...form, password: v})} 
                  />
                   <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#A8A29E" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleRegister} 
              disabled={loading} 
              className={`rounded-2xl py-5 mt-10 shadow-2xl flex-row justify-center items-center ${loading ? "bg-stone-300" : "bg-stone-900"}`}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Text className="text-white text-xs font-black uppercase tracking-[3px] mr-2">Initialize Binding</Text>
                  <Feather name="shield" size={18} color={accentAmber} />
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10 mb-8">
              <Text className="text-stone-400 font-medium">Already Bound? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={{ color: accentAmber }} className="font-bold">Login Terminal</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-stone-400 text-center text-[8px] uppercase tracking-[2px] font-bold mb-4">
              Secure Protocol V4.2 • Restricted Access
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}