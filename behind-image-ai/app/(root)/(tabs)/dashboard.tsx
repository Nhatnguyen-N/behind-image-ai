import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";

const Dashboard = () => {
  const { signOut } = useAuth();
  useEffect(() => {
    async function getData() {
      try {
        const res = await fetch("/(api)/hello");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    getData();
  });
  return (
    <SafeAreaView>
      <Text>Dashboard</Text>
      <TouchableOpacity
        className="bg-primary-200"
        onPress={() => {
          signOut();
        }}
      >
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({});
