// app/index.js
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons"; // for arrow icon

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      {/* "Get Started" button */}
      <TouchableOpacity
        onPress={() => router.push("/login")}
        className="bg-blue-600 w-20 h-20 rounded-full items-center justify-center shadow-lg"
      >
        <Feather name="arrow-right" size={32} color="white" />
      </TouchableOpacity>

      {/* Text below button */}
      <Text className="text-gray-800 text-xl font-semibold mt-4">
        Get Started
      </Text>
    </View>
  );
}
