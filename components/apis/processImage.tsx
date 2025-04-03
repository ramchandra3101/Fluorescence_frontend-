const processImage = async(imageUri: string, signal?: AbortSignal) => {
    try {
        console.log('Starting image upload to API with URI:', imageUri);
        
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'image.jpg',
        } as any);

        // For local development on an Android emulator
        // 10.0.2.2 points to the host machine's localhost
        // For iOS simulator, use localhost or 127.0.0.1
        // For physical devices, use your computer's actual IP address
        
        // Try one of these URLs based on your setup:
        const apiUrl = 'http://10.0.0.160:8000/api/process-image/'; // For iOS simulator
        // const apiUrl = 'http://10.0.2.2:8000/api/process-image/'; // For Android emulator
        // const apiUrl = 'http://YOUR_COMPUTER_IP:8000/api/process-image/'; // For physical device
        
        console.log('Sending request to:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
            signal, // Pass the AbortSignal to fetch
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        return data;
    }
    catch (error) {
        // Display more detailed error information
        if (error instanceof Error) {
            console.log('Error type:', error.name);
            console.log('Error message:', error.message);
            console.log('Full error:', error);
            
            // Check if the error is due to the request being aborted
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.log('Error processing image:', error);
            }
        } else {
            console.log('Unknown error:', error);
        }
        return null; // Return null on error
    }
}

export default processImage;