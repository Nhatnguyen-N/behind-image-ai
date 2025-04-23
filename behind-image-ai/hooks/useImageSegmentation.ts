import * as FileSystem from 'expo-file-system';
import { useUser } from "@clerk/clerk-expo"
import { useState } from 'react';
export function useImageSegmentation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>()
  const [creditsLeft, setCreditsLeft] = useState(0);
  const { user } = useUser()
  const processImage = async (imageUrl: string) => {
    const base64Image = await FileSystem.readAsStringAsync(
      imageUrl, {
      encoding: FileSystem.EncodingType.Base64,
    }
    );
    setIsProcessing(true)
    try {
      const response = await fetch("/(api)/imageSegmentation", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          {
            image: base64Image,
            clerkId: user?.id
          }
        )
      })
      if (!response.ok) {
        throw new Error(`HTTPS error! Status:${response.status}`)
      }
      const result = await response.json();
      const creditsLeft = result.creditsLeft;
      setCreditsLeft(creditsLeft)
      const base64Data = result.data
      const uri = `${FileSystem.documentDirectory}processed-${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(uri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      })
      setProcessedImageUrl(uri)
      return { uri, creditsLeft }
    } catch (error) {
      console.log(error);
      return null;
    } finally {
      setIsProcessing(false)
    }
  }
  const cleanup = () => {
    if (processedImageUrl) {
      FileSystem.deleteAsync(processedImageUrl)
      setProcessedImageUrl(null)
    }
  }
  return {
    processImage, processedImageUrl, isProcessing, cleanup, creditsLeft
  }
}