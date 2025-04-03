import { Image, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';

interface ImagePreviewBoxProps {
    imageUri: string;
    imageName: string;
}

const ImagePreviewBox: React.FC<ImagePreviewBoxProps> = ({ imageUri, imageName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        
        
        // Check if the file exists
        FileSystem.getInfoAsync(imageUri).then((fileInfo) => {
          
            setIsLoading(false);
            if (!fileInfo.exists) {
                setError("File does not exist");
                
            }
        }).catch(err => {
            setIsLoading(false);
            setError(`Error checking file: ${err.message}`);
            
        });
    }, [imageUri]);

    if (isLoading) {
        return (
            <View style={{ width: 300, height: 300, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ffffff" />
                <ThemedText lightColor="white" style={{ marginTop: 10 }}>Loading image...</ThemedText>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ width: 300, height: 300, borderRadius: 8, borderWidth: 1, borderColor: 'white', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                <ThemedText lightColor="white">{error}</ThemedText>
                <ThemedText lightColor="white" style={{ marginTop: 10 }}>URI: {imageUri.substring(0, 50)}...</ThemedText>
            </View>
        );
    }

    return (
        <View style={{ width: 400, height: 400, justifyContent: 'center', alignItems: 'center' }}>
            <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%', borderRadius: 8 }}
                resizeMode="contain"
                onError={(error) => {
                    console.error("Image failed to load:", error.nativeEvent.error);
                    setError(`Failed to load: ${error.nativeEvent.error}`);
                }}
            />
            <ThemedText lightColor='white' type="defaultSemiBold" style={{ marginTop: 10 }}>{imageName}</ThemedText>
        </View>
    );
}

export default ImagePreviewBox;