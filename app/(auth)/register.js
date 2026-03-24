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
      Alert.alert("Registry Error", "All fields required.");
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
        Alert.alert("Registry Initialized", "Hardware bound successfully.", [
          { text: "Access Portal", onPress: () => router.push("/login") }
        ]);
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Registry failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#F5F2F0", "#E7E5E4"]} style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 20 }}>
            
            <TouchableOpacity onPress={() => router.back()} className="mb-8 w-10 h-10 items-center justify-center rounded-xl bg-white border border-stone-200">
              <Feather name="arrow-left" size={20} color="#444" />
            </TouchableOpacity>

            <Text className="text-4xl font-black text-stone-900 mb-1 tracking-tighter uppercase italic">Enrollment</Text>
            <Text className="text-stone-500 mb-8 font-bold text-[10px] uppercase tracking-widest opacity-70">Hardware Binding Active</Text>

            <View className="flex-row space-x-4 mb-10">
              {["student", "professor"].map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  className={`flex-1 py-4 rounded-2xl border-2 items-center ${role === r ? "border-stone-900 bg-stone-900" : "border-white bg-white"}`}
                >
                  <Text className={`capitalize font-black text-[10px] tracking-widest ${role === r ? "text-white" : "text-stone-400"}`}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="space-y-5">
              <TextInput placeholder="Full Legal Name" className="bg-white p-4 rounded-2xl border border-stone-200" onChangeText={(v) => setForm({...form, name: v})} />
              <TextInput placeholder="Academic Email" className="bg-white p-4 rounded-2xl border border-stone-200" keyboardType="email-address" onChangeText={(v) => setForm({...form, email: v})} />
              <TextInput placeholder="Security Cipher" className="bg-white p-4 rounded-2xl border border-stone-200" secureTextEntry onChangeText={(v) => setForm({...form, password: v})} />
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} className={`rounded-2xl py-5 mt-12 shadow-2xl flex-row justify-center items-center ${loading ? "bg-stone-300" : "bg-stone-900"}`}>
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Text className="text-white text-xs font-black uppercase tracking-[3px] mr-2">Complete Binding</Text>
                  <Feather name="shield" size={18} color="white" />
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}