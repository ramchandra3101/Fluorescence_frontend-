import { View, StyleSheet, ImageBackground, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ActionButton from '@/components/ui/ActionButton';
import { BarChart } from 'react-native-chart-kit';
import { useState } from 'react';

interface TubeData {
    R: number;
    G: number;
    B: number;
}

interface Tube {
    [key: string]: TubeData;
}

interface Row {
    [key: string]: Tube[];
}

interface ResultData {
    result_json: string;
}

type ColorType = 'R' | 'G' | 'B';

export default function Results() {
    const router = useRouter();
    const params = useLocalSearchParams<{ result: string }>();
    const [selectedColor, setSelectedColor] = useState<ColorType>('R');
    
    // Parse the JSON string back into an object
    const result: ResultData = params.result ? JSON.parse(params.result) : null;
    
    // Parse the nested result_json string into an object
    const parsedData: Row = result?.result_json ? JSON.parse(result.result_json) : null;

    const getBarChartData = (rowData: Tube[], rowName: string) => {
        const labels = rowData.map(tube => Object.keys(tube)[0]);
        const data = rowData.map(tube => {
            const tubeData = tube[Object.keys(tube)[0]];
            return tubeData[selectedColor];
        });

        return {
            labels,
            datasets: [{
                data: data,
                color: (opacity = 1) => {
                    switch (selectedColor) {
                        case 'R': return `rgba(255, 0, 0, ${opacity})`;
                        case 'G': return `rgba(0, 255, 0, ${opacity})`;
                        case 'B': return `rgba(0, 0, 255, ${opacity})`;
                    }
                },
            }],
        };
    };

    const renderBarChart = (rowData: Tube[], rowName: string) => {
        const chartData = getBarChartData(rowData, rowName);
        const screenWidth = Dimensions.get('window').width;

        return (
            <View style={styles.chartContainer}>
                <BarChart
                    data={chartData}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backgroundGradientFrom: 'rgba(255, 255, 255, 0.1)',
                        backgroundGradientTo: 'rgba(255, 255, 255, 0.1)',
                        decimalPlaces: 2,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                    }}
                    style={styles.chart}
                />
            </View>
        );
    };

    const renderTubeData = (tube: Tube) => {
        const tubeName = Object.keys(tube)[0];
        const data = tube[tubeName];
        return (
            <View key={tubeName} style={styles.tubeContainer}>
                <ThemedText lightColor="white" style={styles.tubeName}>{tubeName}</ThemedText>
                <View style={styles.rgbContainer}>
                    <ThemedText lightColor="white">R: {data.R.toFixed(2)}</ThemedText>
                    <ThemedText lightColor="white">G: {data.G.toFixed(2)}</ThemedText>
                    <ThemedText lightColor="white">B: {data.B.toFixed(2)}</ThemedText>
                </View>
            </View>
        );
    };

    const renderRow = (rowData: Tube[], rowName: string) => {
        return (
            <View key={rowName} style={styles.rowContainer}>
                <ThemedText lightColor="white" style={styles.rowName}>{rowName}</ThemedText>
                {renderBarChart(rowData, rowName)}
                <View style={styles.tubesGrid}>
                    {rowData.map((tube, index) => renderTubeData(tube))}
                </View>
            </View>
        );
    };

    return (
        <ImageBackground source={require('@/assets/images/bg-home.png')} style={{ width: '100%', height: '100%'}} resizeMode='cover'>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
            <ScrollView style={{ flex: 1 }}>
                <View style={{ padding: 20, gap: 16 }}>
                    <ThemedText lightColor="white" style={styles.title}>
                        Processing Results
                    </ThemedText>
                    <View style={styles.colorButtons}>
                        <ActionButton 
                            icon="circle.fill" 
                            title="Red" 
                            color={selectedColor === 'R' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(255, 0, 0, 0.3)'}
                            onPress={() => setSelectedColor('R')}
                        />
                        <ActionButton 
                            icon="circle.fill" 
                            title="Green" 
                            color={selectedColor === 'G' ? 'rgba(0, 255, 0, 0.7)' : 'rgba(0, 255, 0, 0.3)'}
                            onPress={() => setSelectedColor('G')}
                        />
                        <ActionButton 
                            icon="circle.fill" 
                            title="Blue" 
                            color={selectedColor === 'B' ? 'rgba(0, 0, 255, 0.7)' : 'rgba(0, 0, 255, 0.3)'}
                            onPress={() => setSelectedColor('B')}
                        />
                    </View>
                    {parsedData ? (
                        Object.entries(parsedData).map(([rowName, rowData]) => renderRow(rowData, rowName))
                    ) : (
                        <ThemedText lightColor="white">No results available</ThemedText>
                    )}
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <ActionButton 
                    icon="arrow.left" 
                    title="Back" 
                    color='rgba(235, 13, 13, 0.7)'
                    onPress={() => router.back()} 
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    colorButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
    },
    rowContainer: {
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
    },
    rowName: {
        fontSize: 18,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    chartContainer: {
        marginVertical: 8,
        alignItems: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    tubesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
    },
    tubeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 6,
        padding: 8,
        minWidth: '45%',
    },
    tubeName: {
        fontSize: 16,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    rgbContainer: {
        gap: 4,
    },
    buttonContainer: {
        padding: 16,
        alignItems: 'center',
    },
});
