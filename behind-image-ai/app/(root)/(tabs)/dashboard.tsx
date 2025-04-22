import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import InputField from "@/components/CustomInput";
import Header from "@/components/header";
import { useUser } from "@clerk/clerk-expo";
import CustomButton from "@/components/CustomButton";
import CustomState from "@/components/CustomState";
import { useFetch } from "@/lib/fetch";
import { SavedGenerations } from "@prisma/client";
import { router } from "expo-router";

const Dashboard = () => {
  const { user } = useUser();
  const { data, loading, error } = useFetch<SavedGenerations[]>(
    `/(api)/user/${user?.id}`
  );
  if (loading)
    return (
      <SafeAreaView className=" flex justify-between items-center w-full">
        <ActivityIndicator size={"small"} color={"#000"} />
      </SafeAreaView>
    );
  if (error)
    return (
      <SafeAreaView className="flex justify-between items-center w-full">
        <Text>Error:{error}</Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView className="w-full h-full flex-1 bg-white">
      <ScrollView>
        <Header />
        <View className="mx-5 py-0">
          <InputField
            icon={require("@/assets/icons/search.png")}
            placeholder="Search for Saved Generations"
            placeholderTextColor={"gray"}
            textContentType="name"
            className="p-0 m-0"
          />
        </View>
        <View className="mx-5 my-3">
          <Text className="font-rubik text-xl capitalize">
            Hello,
            <Text className="font-rubik-bold ">{user?.username}</Text>! 👋
          </Text>
        </View>
        <View className="mt-1 mx-5 flex flex-row items-center justify-between">
          <View>
            <Text className="font-rubik text-xl capitalize ">
              Saved Generations <Text className="font-rubik-bold">(0)</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              router.push("/(root)/(no-tabs)/create");
            }}
          >
            <Text className="font-rubik text-xl text-primary-200">
              Create +
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          {data && data?.length > 0 ? (
            <View></View>
          ) : (
            <CustomState
              title="No Saved Generations."
              description="There's no saved generations here."
              image={require("@/assets/images/no-created-generations.png")}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({});
