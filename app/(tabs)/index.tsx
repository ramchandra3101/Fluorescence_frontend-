import {ImageBackground,StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

import ActionButton from '@/components/ui/ActionButton';

export default function HomeScreen() {



  return (
      <ImageBackground source={require('@/assets/images/bg-home.png')} style={{ width: '100%', height: '100%'}} resizeMode='cover'>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, }}>
            <ThemedText type="title">Fluorescence Detector</ThemedText>
            <ThemedText style={{ textAlign: 'center' }} type="defaultSemiBold">Upload or capture an image to analyze <ThemedText type="defaultSemiBold" style={{ backgroundColor: 'grey' }}> fluorescence </ThemedText> levels </ThemedText>
            <View style={{ flexDirection: 'column', gap: 16, marginTop: 32 }}>
                <ActionButton icon="camera.fill" title="Capture Image" onPress={() => {}} />
                <ActionButton icon="folder.fill" title="Upload Image" onPress={() => {}} />
            </View>
        </View>
      </ImageBackground>
  );
}

