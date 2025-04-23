import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';


const ImagUpload = async () => {

    try{

        const requestPermission = async() => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission to access camera roll is required!');
                return false;
            }
            return true;
        }

        
        const permission = await requestPermission();
        if (!permission) return null;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
            });
        
      
        
        if (result.canceled) {
            Alert.alert('Image selection was canceled');
            return;
        }
        if (!result.canceled && result.assets && result.assets.length > 0) {
            return result.assets[0].uri;
        }
    
    } catch (error) {
        console.error('Error selecting image:', error);
        Alert.alert('Error selecting image');
    };
}

export default ImagUpload;