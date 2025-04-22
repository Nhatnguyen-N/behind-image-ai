import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Menu } from "lucide-react-native";
const Header = () => {
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
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
