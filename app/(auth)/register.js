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

  const accentAmber = "#D97706";

  useEffect(() => {
    const getHardwareId = async () => {
      try {
        const id = Platform.OS === 'android' 
          ? Application.androidId 
          : await Application.getIosIdForVendorAsync();
        // Sync prefixing logic with Web (WEB- vs MOB-)
        setDeviceId(`MOB-${id.toUpperCase()}`);
      } catch (err) {
        setDeviceId(`MOB-FALLBACK-${Math.random().toString(36).substring(7).toUpperCase()}`);
      }
    };
    getHardwareId();
  }, []);

  const handleRegister = async () => {
    const { name, email, password } = form;
    if (!name || !email || !password) {
      Alert.alert("Registry Error", "All security fields must be populated.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://studentattendanceapi-v4hq.onrender.com/api/auth/register", {
        name,
        email: email.toLowerCase().trim(),
        password,
        role,
        deviceId, 
      });

      if (response.data.success) {
        Alert.alert("Registry Initialized", "Hardware bound to identity successfully.", [
          { text: "Access Portal", onPress: () => router.push("/login") }
        ]);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Registry node connection failure.";
      Alert.alert("Error", msg);
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
            
            <TouchableOpacity onPress={() => router.back()} className="mb-8 w-10 h-10 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-sm">
              <Feather name="arrow-left" size={20} color="#444" />
            </TouchableOpacity>

            <Text className="text-4xl font-black text-stone-900 mb-1 tracking-tighter uppercase italic">Enrollment</Text>
            <Text className="text-stone-500 mb-8 font-bold text-[10px] uppercase tracking-widest opacity-70">Hardware Binding Active</Text>

            <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-4 ml-1">Assign Designation</Text>
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
              <InputLabel label="Full Legal Name" />
              <CustomInput placeholder="John Doe" onChangeText={(val) => setForm({ ...form, name: val })} />

              <InputLabel label="Academic Email" />
              <CustomInput placeholder="name@university.edu" keyboardType="email-address" onChangeText={(val) => setForm({ ...form, email: val })} />

              <InputLabel label="Security Cipher" />
              <CustomInput placeholder="••••••••" secureTextEntry onChangeText={(val) => setForm({ ...form, password: val })} />
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} className={`rounded-2xl py-5 mt-12 shadow-2xl flex-row justify-center items-center ${loading ? "bg-stone-300" : "bg-stone-900"}`}>
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Text className="text-white text-xs font-black uppercase tracking-[3px] mr-2">Initialize Node</Text>
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

const InputLabel = ({ label }) => <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">{label}</Text>;
const CustomInput = (props) => (
  <View className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm mb-4">
    <TextInput {...props} placeholderTextColor="#A8A29E" className="text-stone-900 font-bold" />
  </View>
);