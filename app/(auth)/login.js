import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // THEME COLORS
  const bgMain = "#F5F2F0"; // Your brownish-white
  const accentAmber = "#D97706";

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://studentattendanceapi-v4hq.onrender.com/api/auth/login",
        {
          email: email.toLowerCase().trim(),
          password: password,
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(user));
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Server connection failed. System waking up...";
      Alert.alert("Login Failed", msg);
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
          style={{ flex: 1, paddingHorizontal: 32, justifyContent: "center" }}
        >
          {/* Brand Header */}
          <View className="mb-12 items-center">
            <View className="bg-white p-6 rounded-[32px] mb-6 shadow-xl shadow-stone-200 border border-stone-100">
              <Feather name="shield" size={48} color={accentAmber} />
            </View>
            <Text className="text-4xl font-black text-stone-900 text-center tracking-tight">
              Portal Access
            </Text>
            <Text className="text-stone-500 text-center mt-2 font-medium tracking-wide">
              Secure Attendance Protocol v1.0
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-5">
            <View>
              <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">
                Authorized Email
              </Text>
              <View className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm shadow-stone-100">
                <TextInput
                  placeholder="name@university.edu"
                  placeholderTextColor="#A8A29E"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="text-stone-900 font-bold"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View>
              <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">
                Access Key
              </Text>
              <View className="flex-row items-center bg-white rounded-2xl border border-stone-200 shadow-sm shadow-stone-100">
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#A8A29E"
                  secureTextEntry={!showPassword}
                  className="flex-1 p-4 text-stone-900 font-bold"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-4">
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#78716C" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity className="self-end mt-4 px-1">
            <Text className="text-stone-400 font-bold text-xs uppercase tracking-tighter">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
            className={`rounded-2xl py-5 mt-10 shadow-2xl shadow-stone-400 flex-row justify-center items-center ${
              loading ? "bg-stone-300" : "bg-stone-900"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-sm font-black uppercase tracking-[3px] mr-2">Initialize</Text>
                <Feather name="chevron-right" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Signup Footer */}
          <View className="flex-row justify-center mt-10">
            <Text className="text-stone-400 font-medium">Identity not registered? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={{ color: accentAmber }} className="font-bold">Create Account</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}