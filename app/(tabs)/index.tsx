import {ImageBackground,StyleSheet, View, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ActionButton from '@/components/ui/ActionButton';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ImagUpload from '@/components/ImageUpload';
import CameraCapture from '@/components/CameraCapture';


export default function HomeScreen() {

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async() => {
    try{
      setLoading(true);
      const uri = await ImagUpload();
      setLoading(false);
      if(uri){
        router.push({
          pathname: '/preview',
          params: { imageUri: encodeURIComponent(uri), imageName: 'Uploaded Image' },
        });
      }
      } catch (error) {
        setLoading(false);
       
        Alert.alert('Error selecting image');
      }
  }

  const handleImageCapture = async() => {
    try{
      setLoading(true);
      const uri = await CameraCapture();
      setLoading(false);
      if(uri){
        
        router.push({
          pathname: '/preview',
          params: { imageUri: encodeURIComponent(uri), imageName: 'Captured Image' },
        });
      }
      } catch (error) {
        setLoading(false);
        
        Alert.alert('Error capturing image');
      }
  }

  return (
      <ImageBackground source={require('@/assets/images/bg-home.png')} style={{ width: '100%', height: '100%'}} resizeMode='cover'>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, }}>
            <ThemedText type="title" lightColor='white'>Fluorescence Detector</ThemedText>
            <ThemedText  lightColor='white' style={{ textAlign: 'center' }} type="defaultSemiBold">Upload or capture an image to analyze <ThemedText type="defaultSemiBold" style={{ backgroundColor: 'grey' }}> fluorescence </ThemedText> levels </ThemedText>
            <View style={{ flexDirection: 'column', gap: 16, marginTop: 32 }}>
                <ActionButton icon="camera.fill" title="Capture Image" color='rgba(245, 245, 245, 0.7)' onPress={handleImageCapture} />
                <ActionButton icon="folder.fill" title={loading?"Loading...":"Upload Image"} color='rgba(245, 245, 245, 0.7)' onPress={handleImageUpload}/>
            </View>
        </View>
      </ImageBackground>
  );
}

