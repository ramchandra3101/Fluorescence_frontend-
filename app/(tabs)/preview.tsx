import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import ActionButton from '@/components/ui/ActionButton';
import { ImageBackground } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ImagePreviewBox from '@/components/ui/ImagePreviewBox';

export default function Preview() {
    const router = useRouter();
    const params = useLocalSearchParams<{ imageUri: string, imageName:string}>();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);

    useEffect(()=> {
        console.log("Raw Params:",params);
        if(params.imageUri){
            const decodedUri = params.imageUri;
            console.log("Decoded URI:", decodedUri);
            setImageUri(decodedUri);
        }
        if(params.imageName){
            setImageName(params.imageName);
        }
    }, [params.imageUri, params.imageName]);

    const handleProcess = () => {
        // Add your processing logic here
        console.log("Processing image...");
    }

    return (
        <ImageBackground source={require('@/assets/images/bg-home.png')} style={{ width: '100%', height: '100%'}} resizeMode='cover'>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                    {imageUri && imageName? (
                    <ImagePreviewBox imageUri={imageUri} imageName={imageName} />
                ) : (
                    <View style={{width: 300, height: 300, borderRadius: 8, borderWidth: 1, borderColor: 'white', justifyContent: 'center', alignItems: 'center',backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
                        <ThemedText lightColor='white'>No image selected</ThemedText>
                    </View>
                )}
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 10, marginBottom: 64 }}>
                    <ActionButton icon="clock.fill" title="Processs" color ='rgba(13, 235, 102, 0.7)' onPress={handleProcess} />
                    <ActionButton icon="arrow.left" title="Back"  color ='rgba(235, 13, 13, 0.7)'onPress={() => router.back()} />
                </View>
            </View>
        </ImageBackground>
        
    
    )
}

