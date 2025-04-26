import { Alert, Image, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import CustomButton from "./CustomButton";
import { useStripe } from "@stripe/stripe-react-native";
import { useAuth } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import ReactNativeModal from "react-native-modal";
import { router } from "expo-router";

const Payment = ({
  fullName,
  email,
  amount,
}: {
  fullName: string | null | undefined;
  email: string | null | undefined;
  amount: string;
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);
  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "usd",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback
        ) => {
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create-stripe",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email?.split("@")[0],
                email: email,
                amount: amount,
              }),
            }
          );
          console.log("payment intent", paymentIntent.client_secret);
          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });
            if (result.client_secret) {
              await fetchAPI("/(api)/subscription/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user_id: userId,
                  showAds: false,
                  plan: "PRO",
                }),
              });
              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "myapp://dashboard",
    });
    if (!error) {
    }
  };
  const openPaymentSheet = async () => {
    await initializePaymentSheet();
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
    }
  };
  return (
    <View>
      <CustomButton
        title="Subscribe Now! - $10/month"
        className="my-[10px] bg-primary-200"
        onPress={openPaymentSheet}
      />
      <ReactNativeModal
        isVisible={success}
        onBackButtonPress={() => setSuccess(false)}
      >
        <View
          className="flex flex-col items-center justify-center
        bg-white p-7 rounded-2xl"
        >
          <Image
            source={require("@/assets/images/order-success.png")}
            className="w-28 h-28 mt-5"
          />
          <Text className="text-2xl text-center font-rubik-bold mt-5">
            Congrats, you're now a PRO member!
          </Text>
          <Text
            className="text-md text-green-200
           font-rubik-medium text-center mt-3"
          >
            Thank you for your purchase. You're now a family of PRO members!
          </Text>
          <CustomButton
            title="Back to Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/dashboard");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({});
