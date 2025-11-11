// app/index.js
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-blue-600 items-center justify-center px-6">
      {/* Logo or illustration */}
      <Image
        source={require("../assets/images/icon.png")}
        className="w-40 h-40 mb-8"
        resizeMode="contain"
      />

      {/* App name */}
      <Text className="text-white text-3xl font-extrabold mb-2">
        Student Attendance
      </Text>
      <Text className="text-blue-100 text-center mb-8">
        Manage attendance easily using QR codes
      </Text>

      {/* Buttons */}
      <View className="w-full mt-4">
        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="bg-white py-4 rounded-2xl mb-4"
        >
          <Text className="text-blue-600 text-center text-lg font-semibold">
            Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          className="border border-white py-4 rounded-2xl"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
