import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }
    // Here you can add real authentication logic
    router.push("/(tabs)/home");
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#f5e3d5"]}
      start={{ x: 0.2, y: 0.1 }}
      end={{ x: 0.8, y: 0.9 }}
      className="flex-1 justify-center px-6"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        {/* Header */}
        <View className="mb-10">
          <Text className="text-4xl font-extrabold text-gray-900 text-center mb-2">
            Welcome Back 👋
          </Text>
          <Text className="text-gray-600 text-center text-base">
            Log in to continue marking attendance easily with QR codes.
          </Text>
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-gray-800 font-semibold mb-2">Email</Text>
          <TextInput
            placeholder="Enter your email"
            keyboardType="email-address"
            className="bg-white rounded-xl p-4 border border-gray-200 text-gray-900"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password with Eye Toggle */}
        <View className="mb-4">
          <Text className="text-gray-800 font-semibold mb-2">Password</Text>
          <View className="flex-row items-center bg-white rounded-xl border border-gray-200">
            <TextInput
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              className="flex-1 p-4 text-gray-900"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="px-4"
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="#777"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          className="self-end mb-6"
        >
          <Text className="text-[#f5a623] font-semibold text-sm">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          className={`rounded-xl py-4 shadow-md ${
            email.trim() && password.trim()
              ? "bg-[#f5a623]"
              : "bg-gray-400"
          }`}
          disabled={!email.trim() || !password.trim()}
        >
          <Text className="text-center text-white text-lg font-semibold">
            Log In
          </Text>
        </TouchableOpacity>

        {/* Signup redirect */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-700">Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text className="text-[#f5a623] font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
