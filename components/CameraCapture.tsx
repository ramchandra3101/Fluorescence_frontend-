import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const CameraCapture = async () => {
    try {
        // Request camera permissions
        const requestPermission = async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission to access the camera is required!');
                return false;
            }
            return true;
        };

        const permission = await requestPermission();
        if (!permission) return;

        // Launch the camera
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (result.canceled) {
            Alert.alert('Camera capture was canceled');
            return;
        }

        if (!result.canceled) {
            Alert.alert('Image captured successfully');
        }

        return result.assets[0].uri; // Return the captured image URI
    } catch (error) {
        
        Alert.alert('Error capturing image');
    }
};

export default CameraCapture;