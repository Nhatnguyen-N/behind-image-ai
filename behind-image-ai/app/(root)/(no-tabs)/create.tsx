import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Canvas, { Image as CanvasImage } from "react-native-canvas";
import ColorPicker from "react-native-wheel-color-picker";
import { useImageSegmentation } from "@/hooks/useImageSegmentation";

type TextPlayer = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: number;
  color: string;
  opacity: number;
  rotation: number;
};
const CreateImage = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [textLayers, setTextLayers] = useState<TextPlayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const {
    processImage,
    processedImageUrl,
    cleanup,
    isProcessing,
    creditsLeft,
  } = useImageSegmentation();
  const [remainingCredits, setRemainingCredits] = useState(creditsLeft);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [canvasImageUri, setCanvasImageUri] = useState("");

  const canvasRef = useRef<Canvas>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const canvasHeight = screenHeight * 0.4;
  const textLayersRef = useRef(textLayers);

  useEffect(() => {
    textLayersRef.current = textLayers;
  }, [textLayers]);

  const handleAddTextLayer = () => {
    const newLayer: TextPlayer = {
      id: Math.random().toString(),
      text: "New Text Layer",
      x: 50,
      y: 50,
      fontSize: 48,
      fontWeight: 400,
      color: "#000000",
      opacity: 1,
      rotation: 0,
    };
    setTextLayers([...textLayers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };
  const updateLayer = (id: string, updates: Partial<TextPlayer>) => {
    setTextLayers((layers) =>
      layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      )
    );
  };
  const drawOnCanvas = useCallback(
    async (layers: TextPlayer[]) => {
      if (!canvasRef.current || !imageUrl || !processedImageUrl) return;
      try {
        const ctx = canvasRef.current.getContext("2d");
        const img = new CanvasImage(canvasRef.current);
        const img_2 = new CanvasImage(canvasRef.current);

        canvasRef.current.width = screenWidth;
        canvasRef.current.height = canvasHeight;

        const [originalBase64, processedBase64] = await Promise.all([
          FileSystem.readAsStringAsync(imageUrl, {
            encoding: FileSystem.EncodingType.Base64,
          }),
          FileSystem.readAsStringAsync(processedImageUrl, {
            encoding: FileSystem.EncodingType.Base64,
          }),
        ]);
        const imgLoaded = new Promise((resolve) =>
          img.addEventListener("load", resolve)
        );
        const img2Loaded = new Promise((resolve) =>
          img_2.addEventListener("load", resolve)
        );
        img.src = `data:image/png;base64,${processedBase64}`;
        img_2.src = `data:image/png;base64,${originalBase64}`;

        await Promise.all([imgLoaded, img2Loaded]);

        const ratio = Math.min(
          screenWidth / img_2.width,
          canvasHeight / img_2.height
        );
        const displayWidth = img_2.width * ratio;
        const displayHeight = img_2.height * ratio;

        ctx.clearRect(0, 0, screenWidth, canvasHeight);

        //Draw original image
        ctx.drawImage(
          img_2,
          (screenWidth - displayWidth) / 2,
          (canvasHeight - displayHeight) / 2,
          displayWidth,
          displayHeight
        );

        //Draw text layers
        layers.forEach((layer) => {
          ctx.save();
          ctx.translate(layer.x, layer.y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.font = ` ${layer.fontWeight} ${layer.fontSize}px Arial`;
          ctx.fillStyle = layer.color;
          ctx.globalAlpha = layer.opacity;
          ctx.fillText(layer.text, 0, 0);
          ctx.restore();
        });

        //Draw processed image
        ctx.drawImage(
          img,
          (screenWidth - displayWidth) / 2,
          (canvasHeight - displayHeight) / 2,
          displayWidth,
          displayHeight
        );
      } catch (error) {
        console.log("Error drawing image", error);
      }
    },
    [imageUrl, processedImageUrl, screenWidth, canvasHeight]
  );

  const captureCanvasImage = async () => {
    if (!canvasRef.current) return;
    try {
      const imageData = await canvasRef.current.toDataURL();
      setCanvasImageUri(imageData);
    } catch (error) {
      console.error("Error capturing canvas image", error);
    }
  };
  const toggleFullScreen = async () => {
    if (!isFullScreen) await captureCanvasImage();
    setIsFullScreen(!isFullScreen);
  };
  useEffect(() => {
    drawOnCanvas(textLayers); // Pass current text layers explicity
  }, [drawOnCanvas, processedImageUrl, textLayers]); // Keep textLayers in dependencies

  const handleSliderChange = (value: number, property: keyof TextPlayer) => {
    if (!selectedLayerId) return;
    const updatedLayers = textLayers.map((layer) => {
      if (layer.id === selectedLayerId) {
        return { ...layer, [property]: value };
      }
      return layer;
    });
    setTextLayers(updatedLayers);
    textLayersRef.current = updatedLayers;
    requestAnimationFrame(() => drawOnCanvas(updatedLayers));
  };
  const handleImageUpLoad = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      try {
        await processImage(result.assets[0].uri)
          .then((res) => {
            setImageUrl(result.assets[0].uri);
            Alert.alert("Image Processed Successfully");
            setRemainingCredits(res?.creditsLeft);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.error("Image processing failed", error);
      }
    }
  };
  const handleDownload = async () => {
    if (!canvasRef.current || !imageUrl || !processedImageUrl) {
      Alert.alert("Error", "Please process an image first");
      return;
    }
    try {
      //Ensure canvas has latest state
      await drawOnCanvas(textLayersRef.current);
      //Get canvas image data
      const dataUrl = await canvasRef.current.toDataURL();
      const base64Data = dataUrl.split(",")[1];
      if (!base64Data) {
        Alert.alert("Error", "Failed to capture canvas image");
        return;
      }
      //Create unique filename
      const filename = `edited-image-${Date.now()}.png`;
      const fileUri = FileSystem.cacheDirectory + filename;
      //Write base64 data to file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      //Save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("Downloads", asset, false);
        Alert.alert("Success", "Image saved to Library");
      } else {
        Alert.alert(
          "Permission Required",
          "Please enable photo library access in settings"
        );
      }
    } catch (error: any) {
      console.error("Download error", error);
      Alert.alert(
        "Download Failed",
        error.message || "Failed to save image. Please try again."
      );
    }
  };
  const selectedLayer = textLayers.find(
    (layer) => layer.id === selectedLayerId
  );
  // Add this function inside the component
  const handleDeleteLayer = (layerId: string) => {
    setTextLayers((layers) => {
      const newLayers = layers.filter((layer) => layer.id !== layerId);
      //Clear selection if deleted layer was selected
      if (selectedLayerId === layerId) {
        setSelectedLayerId(newLayers[0]?.id || null);
      }
      return newLayers;
    });
  };
  return (
    <View>
      <Text>Create</Text>
    </View>
  );
};

export default CreateImage;

const styles = StyleSheet.create({});
