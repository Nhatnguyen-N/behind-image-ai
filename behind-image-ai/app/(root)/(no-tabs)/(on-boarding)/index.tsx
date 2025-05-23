import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type SlideProps = {
  id: string;
  image: any;
  title: string;
  description: string;
};
const { width, height } = Dimensions.get("window");
export default function OnboardingScreen() {
  const slides: SlideProps[] = [
    {
      id: "1",
      image: require("@/assets/images/onboarding/onboarding-1.png"),
      title: "Welcome to the BehindImageAI",
      description: "Don't Let Your Text Overlays You!",
    },
    {
      id: "2",
      image: require("@/assets/images/onboarding/onboarding-2.png"),
      title: "Upload Your Image.",
      description:
        "Upload one of your preferred image which you want to do not overlay the text.",
    },
    {
      id: "3",
      image: require("@/assets/images/onboarding/onboarding-3.png"),
      title: "Let AI do It's Magic🪄",
      description: "Our AI App will detects the subject in the image.",
    },
    {
      id: "4",
      image: require("@/assets/images/onboarding/onboarding-4.png"),
      title: "Edit Settings and Download",
      description: "Edit your preferrable settings and donwload the image.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);
  const updateCurrentSlideIndex = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentIndex + 1;
    if (nextSlideIndex !== slides.length) {
      slidesRef.current?.scrollToIndex({
        index: nextSlideIndex,
        animated: true,
      });
      setCurrentIndex(nextSlideIndex);
    }
  };
  const Slide = ({ item }: { item: SlideProps }) => {
    return (
      <View
        style={{ width, paddingTop: height * 0.1 }}
        className={`items-center px-[24px]`}
      >
        <Image
          source={item.image}
          className="w-full h-[300px] mb-[32px]"
          resizeMode="contain"
        />
        <Text className="text-3xl font-rubik-bold text-black mb-[16px] text-center">
          {item.title}
        </Text>
        <Text className="text-[20px] text-gray-400 text-center px-[24px] ">
          {item.description}
        </Text>
      </View>
    );
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-[24px] pt-[16px]">
        <View className="flex-row items-center">
          <Text className="text-[24px] font-rubik-bold text-black">
            {currentIndex + 1}
          </Text>
          <Text className="text-[24px] text-gray-300">/{slides.length}</Text>
        </View>
        <TouchableOpacity
          className=""
          onPress={() => {
            router.push("/(root)/(no-tabs)/(auth)/sign-in");
          }}
        >
          <Text className="text-[20px] text-gray-300">Skip</Text>
        </TouchableOpacity>
      </View>
      {/* Carousel */}
      <FlatList
        ref={slidesRef}
        data={slides}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        bounces={false}
      />
      {/* Bottom Navigation Container */}
      <View className=" flex-row items-center justify-between px-[24px] mb-[32px] absolute bottom-0 left-0 right-0 ">
        {/* Empty view để cân đối trái */}
        <View style={{ width: 100 }} />
        <View className="flex-row flex-1 justify-center items-center ">
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndocator,
              ]}
            />
          ))}
        </View>
        {/* Next Button */}
        <TouchableOpacity
          onPress={() => {
            if (currentIndex === slides.length - 1) {
              router.replace("/(root)/(no-tabs)/(auth)/sign-in");
            } else {
              goToNextSlide();
            }
          }}
          className="items-end justify-center"
          style={{ width: 100 }}
        >
          <Text className="text-primary-100 font-rubik text-lg">
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dddddd",
    marginHorizontal: 4,
  },
  activeIndocator: {
    backgroundColor: "#000",
    width: 24,
  },
});
