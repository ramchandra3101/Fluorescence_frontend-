import { View, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import ActionButton from '@/components/ui/ActionButton';
import { ThemedText } from '@/components/ThemedText';
import ImagePreviewBox from '@/components/ui/ImagePreviewBox';
import processImage from '@/components/apis/processImage';

export default function Preview() {
    const router = useRouter();
    const params = useLocalSearchParams<{ imageUri: string, imageName: string }>();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    // Use a ref to track if component is mounted
    const isMounted = useRef(true);
    // Use a ref to store the abort controller
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (params.imageUri) {
            setImageUri(params.imageUri);
        }
        if (params.imageName) {
            setImageName(params.imageName);
        }

        // Set isMounted to true when component mounts
        isMounted.current = true;

        // Clean up function when component unmounts
        return () => {
            isMounted.current = false;
            // Abort any ongoing fetch when unmounting
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [params.imageUri, params.imageName]);

    const handleProcess = async () => {
        setIsProcessing(true);
        console.log("Processing image...");
        
        if (!imageUri) {
            console.log('No image URI provided');
            setIsProcessing(false);
            return;
        }

        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();
        
        try {
            const result = await processImage(imageUri, abortControllerRef.current.signal);

            // Check if component is still mounted before updating state
            if (isMounted.current) {
                
                if (!result) {
                    console.log('No result from processing');
                } else {
                    console.log('Image processed successfully');
                    
                    router.push({
                        pathname: '/results',
                        params: {
                            result: JSON.stringify(result)
                        },
                    });
                }
                
                setIsProcessing(false);
            }
        } catch (error) {
            // Only update state if component is still mounted
            if (isMounted.current) {
                console.error('Processing error:', error);
                setIsProcessing(false);
            }
        }
    };

    const handleBack = () => {
        // Cancel any ongoing processing
        if (isProcessing && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Reset processing state
        setIsProcessing(false);
        
        // Navigate back
        router.back();
    };

    return (
        <ImageBackground source={require('@/assets/images/bg-home.png')} style={{ width: '100%', height: '100%'}} resizeMode='cover'>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                {isProcessing ? (
                    <View style={{ width: 300, height: 300, justifyContent: 'center', alignItems: 'center'}}>
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
                    <ActionButton 
                        icon="arrow.left" 
                        title="Back" 
                        color='rgba(235, 13, 13, 0.7)' 
                        onPress={handleBack} 
                    />
                </View>
            </View>
        </ImageBackground>
    );
}