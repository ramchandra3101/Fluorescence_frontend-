import { View, StyleSheet,ImageBackground, ActivityIndicator} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import ActionButton from '@/components/ui/ActionButton';
import { ThemedText } from '@/components/ThemedText';
import ImagePreviewBox from '@/components/ui/ImagePreviewBox';

export default function Preview() {
    const router = useRouter();
    const params = useLocalSearchParams<{ imageUri: string, imageName:string}>();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);


    useEffect(()=> {
       

        if(params.imageUri){
            setImageUri(params.imageUri);
        }
        if(params.imageName){
            setImageName(params.imageName);
        }
    }, [params.imageUri, params.imageName]);

    const handleProcess = () => {
        setIsProcessing(true);
        // Add your processing logic here
        console.log("Processing image...");

        setTimeout(() => {
            setIsProcessing(false);
            // Navigate to a results page or update state as needed
            // router.push('/results');
        }, 2000);
    }
    return (
        <ImageBackground source={require('@/assets/images/bg-home.png')} style={{ width: '100%', height: '100%'}} resizeMode='cover'>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                    <ThemedText type="title" lightColor='white'>Fluorescence Detector</ThemedText>
                    <ThemedText lightColor='white' style={{ textAlign: 'center' }} type="defaultSemiBold">Preview of the uploaded image</ThemedText>
                    {isProcessing ? (
                    <View style={{ width: 300, height: 300, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#0DEBCC" />
                        <ThemedText lightColor="white" style={{ marginTop: 10 }}>Processing image...</ThemedText>
                    </View>
                ) : imageUri && imageName ? (
                    <ImagePreviewBox imageUri={imageUri} imageName={imageName} />
                ) : (
                    <View
                        style={{
                            width: 300,
                            height: 300,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: 'white',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <ThemedText lightColor="white">No image selected</ThemedText>
                    </View>
                )}
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 10, marginBottom: 64 }}>
                <ActionButton 
                        icon="clock.fill" 
                        title={isProcessing ? "Processing..." : "Process"} 
                        color='rgba(13, 235, 102, 0.7)' 
                        onPress={handleProcess} 
                        
                    />
                    <ActionButton icon="arrow.left" title="Back"  color ='rgba(235, 13, 13, 0.7)'onPress={() => router.back()} />
                </View>
            </View>
        </ImageBackground>
        
    
    )
}

