// app/index.js
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#ffffff", "#f5e3d5"]}
      start={{ x: 0.2, y: 0.1 }}
      end={{ x: 0.8, y: 0.9 }}
      className="flex-1 items-center justify-center px-6"
    >
      <Image
        source={require("../assets/images/qr-code-scanning-concept (1).png")}
        className="w-60 h-60 mb-8"
        resizeMode="contain"
      />

      <Text className="text-4xl font-extrabold text-gray-900 mb-3 text-center">
        Smart Attendance
      </Text>

      <Text className="text-lg text-gray-700 font-semibold text-center mb-2">
        Scan. Record. Verify.
      </Text>

      <Text className="text-base text-gray-600 text-center mb-12 leading-relaxed">
        Manage student attendance with ease using <Text className="font-semibold text-gray-800">QR codes</Text>.  
        Our system ensures <Text className="font-semibold text-gray-800">accuracy</Text>,  
        eliminates <Text className="font-semibold text-gray-800">manual errors</Text>,  
        and saves time for both <Text className="font-semibold text-gray-800">students</Text> and <Text className="font-semibold text-gray-800">admins</Text>.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/login")}
        className="bg-white/90 w-20 h-20 rounded-full items-center justify-center shadow-lg"
        style={{ marginTop: 20 }}
      >
        <Feather name="arrow-right" size={32} color="#f5a623" />
      </TouchableOpacity>

      <Text className="text-gray-700 text-lg mt-4 font-semibold tracking-wide">
        Get Started
      </Text>
    </LinearGradient>
  );
}
