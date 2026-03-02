import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // THEME COLORS
  const accentAmber = "#D97706";

  const handleRegister = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      Alert.alert("Required", "Security protocols require all fields to be populated.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://studentattendanceapi-v4hq.onrender.com/api/auth/register", {
        name,
        email: email.toLowerCase().trim(),
        password,
        role,
      });

      if (response.data.success) {
        Alert.alert("Identity Verified", "Account created successfully. You may now initialize your session.", [
          { text: "Proceed to Login", onPress: () => router.push("/login") }
        ]);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed. Please check your connection.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#F5F2F0", "#E7E5E4"]} style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 20 }}
          >
            {/* Header */}
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="mb-8 w-10 h-10 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-sm"
            >
              <Feather name="arrow-left" size={20} color="#444" />
            </TouchableOpacity>

            <Text className="text-4xl font-black text-stone-900 mb-2 tracking-tight">Create Identity</Text>
            <Text className="text-stone-500 mb-8 font-medium">Join the secure attendance network.</Text>

            {/* Role Picker */}
            <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-4 ml-1">
              Select Designation
            </Text>
            <View className="flex-row space-x-4 mb-10">
              {["student", "professor"].map((r) => (
                <TouchableOpacity
                  key={r}
                  activeOpacity={0.8}
                  onPress={() => setRole(r)}
                  className={`flex-1 py-4 rounded-2xl border-2 items-center shadow-sm ${
                    role === r ? "border-stone-900 bg-stone-900" : "border-white bg-white"
                  }`}
                >
                  <Text className={`capitalize font-black text-xs tracking-widest ${role === r ? "text-white" : "text-stone-400"}`}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Inputs */}
            <View className="space-y-5">
              <View>
                <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">Full Name</Text>
                <View className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm shadow-stone-100">
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor="#A8A29E"
                    className="text-stone-900 font-bold"
                    onChangeText={(val) => setForm({ ...form, name: val })}
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">University Email</Text>
                <View className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm shadow-stone-100">
                  <TextInput
                    placeholder="email@university.edu"
                    placeholderTextColor="#A8A29E"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="text-stone-900 font-bold"
                    onChangeText={(val) => setForm({ ...form, email: val })}
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">Secure Password</Text>
                <View className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm shadow-stone-100">
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#A8A29E"
                    secureTextEntry
                    className="text-stone-900 font-bold"
                    onChangeText={(val) => setForm({ ...form, password: val })}
                  />
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
              className={`rounded-2xl py-5 mt-12 shadow-2xl shadow-stone-400 flex-row justify-center items-center ${
                loading ? "bg-stone-300" : "bg-stone-900"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-sm font-black uppercase tracking-[3px] mr-2">Confirm Identity</Text>
                  <Feather name="shield" size={18} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center mt-10 mb-10">
              <Text className="text-stone-400 font-medium">Already registered? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={{ color: accentAmber }} className="font-bold">Log In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}