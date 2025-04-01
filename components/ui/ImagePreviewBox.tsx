import { Image, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';


interface ImagePreviewBoxProps {
    imageUri:string ;
    imageName: string;
}



const ImagePreviewBox: React.FC<ImagePreviewBoxProps> = ({ imageUri,imageName}) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <ThemedText type="title" lightColor='white'>Fluorescence Detector</ThemedText>
            <Image source={{ uri: imageUri }} style={{ width: '90%', height: '70%', borderRadius: 8 }} resizeMode='contain' />
            <ThemedText lightColor='white' type="defaultSemiBold">{imageName}</ThemedText>
        </View>
    );
}
export default ImagePreviewBox;