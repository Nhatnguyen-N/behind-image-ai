import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Menu } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import ReactNativeModal from "react-native-modal";
import { useAuth } from "@clerk/clerk-react";
const Header = () => {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <View
      className="w-full flex-row items-center px-4 py-3
   bg-white shadow-xl shadow-gray-500 rounded-2xl"
    >
      {/* Hamburger Icon */}
      <TouchableOpacity className="p-2">
        <Menu size={28} color={"black"} />
      </TouchableOpacity>
      {/* Logo-Centered */}
      <View className="flex-1 items-start">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-[100px] h-[40px]"
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity onPress={() => setOpen(true)}>
        <Ionicons name="log-out" size={30} color={"black"} />
      </TouchableOpacity>
      <ReactNativeModal isVisible={open}>
        <View className="bg-white p-6 rounded-xl">
          <Text className="font-rubik-bold text-lg mb-4">
            Are you sure to Logout?
          </Text>
          <Text className="font-rubik mb-6 text-gray-400">
            You'll be logged out, if you confirmed.
          </Text>
          <View className="flex-row justify-end gap-4">
            <TouchableOpacity
              onPress={() => setOpen(false)}
              className="px-4 py-2"
            >
              <Text className="font-rubik-medium text-gray-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => signOut()}
              className="px-4 py-2 bg-red-500 rounded-lg"
            >
              <Text className="font-rubik-bold text-white">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReactNativeModal>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
