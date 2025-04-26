import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import InputField from "@/components/CustomInput";
import Header from "@/components/header";
import { useAuth, useUser } from "@clerk/clerk-expo";
import CustomButton from "@/components/CustomButton";
import CustomState from "@/components/CustomState";
import { useFetch } from "@/lib/fetch";
import { SavedGenerations } from "@prisma/client";
import { Redirect, router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomLoader from "@/components/CustomLoader";
import SavedGenerationCard from "@/components/SavedGenerationCard";

const Dashboard = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { data, loading, error, refetch } = useFetch<any>(
    `/(api)/user/${user?.id}`
  );
  const [savedGenerations, setSavedGenerations] = useState([]);
  useEffect(() => {
    if (data?.savedGenerations) {
      setSavedGenerations(data.savedGenerations);
    }
  }, [data]);
  const handleDeleteGeneration = (generationId: string) => {
    setSavedGenerations((prev) =>
      prev.filter((gen: any) => gen.id !== generationId)
    );
    refetch();
  };

  if (loading) return <CustomLoader loading={loading} />;
  if (error)
    return (
      <SafeAreaView className="flex justify-between items-center w-full">
        <Text>Error:{error}</Text>
      </SafeAreaView>
    );
  if (!isSignedIn) {
    return <Redirect href={"/(root)/(no-tabs)/(auth)/sign-in"} />;
  }
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
          <Text className="font-rubik text-2xl capitalize">
            Hello,{" "}
            <Text className="font-rubik-bold text-primary-100">
              {user?.username}{" "}
            </Text>
            ! 👋
          </Text>
          <View>
            {data?.plan === "FREE" ? (
              <TouchableOpacity
                onPress={() => router.push("/(root)/(no-tabs)/subscribe")}
                className="px-safe-offset-2 w-[50%] flex flex-row items-center justify-between bg-yellow-500 rounded-lg"
              >
                <View className="flex flex-row">
                  <Image
                    source={require("@/assets/images/diamond.png")}
                    resizeMode="contain"
                    className="w-[20px] h-[20px]"
                  />
                </View>
                <Text className="text-white">Be a Pro Member</Text>
                <View>
                  <ArrowRight color={"white"} size={15} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {}}
                className="w-[35%] flex flex-row justify-center bg-green-500 rounded-lg"
              >
                <View className="flex flex-row gap-x-3 items-center">
                  <Image
                    source={require("@/assets/images/diamond.png")}
                    resizeMode="contain"
                    className="w-[20px] h-[20px]"
                  />
                  <Text className="text-white">Pro Member</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View className="mt-1 mx-5 flex flex-row items-center justify-between">
          <View>
            <Text className="font-rubik text-xl capitalize ">
              Saved Generations{" "}
              <Text className="font-bold">
                ({data?.savedGenerations?.length})
              </Text>
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
        <View className="mx-2">
          {data?.savedGenerations && data?.savedGenerations?.length > 0 ? (
            savedGenerations.map((generation: any) => (
              <SavedGenerationCard
                key={generation.id}
                id={generation.id}
                name={generation.name}
                imageUrl={generation.imageUrl}
                onDelete={handleDeleteGeneration}
              />
            ))
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
