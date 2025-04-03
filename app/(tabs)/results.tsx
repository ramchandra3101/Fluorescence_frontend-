import { View, StyleSheet, ImageBackground, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ActionButton from '@/components/ui/ActionButton';
import { BarChart } from 'react-native-chart-kit';
import { useState, useEffect } from 'react';

interface TubeData {
    R: number;
    G: number;
    B: number;
}

interface Tube {
    [key: string]: TubeData;
}

interface RowData {
    [key: string]: Tube[];
}

type ColorType = 'R' | 'G' | 'B';
type ViewMode = 'values' | 'chart';

export default function Results() {
    const router = useRouter();
    const params = useLocalSearchParams<{ result: string }>();
    const [selectedColor, setSelectedColor] = useState<ColorType>('R');
    const [viewMode, setViewMode] = useState<ViewMode>('values');
    const [parsedData, setParsedData] = useState<RowData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (params.result) {
            try {
                // Parse the result data
                const resultObj = JSON.parse(params.result);
                console.log("Parsed result object:", resultObj);
                
                // Check if resultObj itself is the data we need
                if (resultObj && typeof resultObj === 'object' && 'Row1' in resultObj) {
                    console.log("Using resultObj directly as it contains Row1");
                    setParsedData(resultObj);
                } 
                // Check if result_json exists and is already an object
                else if (resultObj && resultObj.result_json && typeof resultObj.result_json === 'object') {
                    console.log("Using result_json which is already an object");
                    setParsedData(resultObj.result_json);
                } 
                // Check if result_json exists and is a string that needs parsing
                else if (resultObj && resultObj.result_json && typeof resultObj.result_json === 'string') {
                    console.log("Parsing result_json string");
                    const parsedJson = JSON.parse(resultObj.result_json);
                    setParsedData(parsedJson);
                } 
                else {
                    setError("Invalid result format");
                    console.error("Invalid result format - couldn't find row data:", resultObj);
                }
            } catch (error) {
                console.error("Error processing result data:", error);
                setError("Could not process result data: " + (error instanceof Error ? error.message : String(error)));
            }
        } else {
            setError("No result data received");
        }
    }, [params.result]);

    const getBarChartData = (rowData: Tube[] | undefined, rowName: string) => {
        // Safety check for undefined rowData
        if (!rowData || !Array.isArray(rowData)) {
            console.error(`Row data for ${rowName} is not an array:`, rowData);
            return {
                labels: [],
                datasets: [{ data: [], color: () => 'rgba(255, 0, 0, 1)' }]
            };
        }

        const labels = rowData.map(tube => {
            const keys = Object.keys(tube);
            return keys.length > 0 ? keys[0] : 'Unknown';
        });
        
        const data = rowData.map(tube => {
            const tubeName = Object.keys(tube)[0];
            const tubeData = tube[tubeName];
            return tubeData ? tubeData[selectedColor] : 0;
        });

        return {
            labels,
            datasets: [{
                data,
                color: (opacity = 1) => {
                    switch (selectedColor) {
                        case 'R': return `rgba(255, 0, 0, ${opacity})`;
                        case 'G': return `rgba(0, 255, 0, ${opacity})`;
                        case 'B': return `rgba(0, 0, 255, ${opacity})`;
                        default: return `rgba(255, 255, 255, ${opacity})`;
                    }
                },
            }],
        };
    };

    const renderBarChart = (rowData: Tube[] | undefined, rowName: string) => {
        // Safety check
        if (!rowData || !Array.isArray(rowData) || rowData.length === 0) {
            return (
                <View style={styles.chartError}>
                    <ThemedText lightColor="white">No data available for chart</ThemedText>
                </View>
            );
        }

        const chartData = getBarChartData(rowData, rowName);
        const screenWidth = Dimensions.get('window').width;

        return (
            <View style={styles.chartContainer}>
                <BarChart
                    data={chartData}
                    width={screenWidth - 60}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero={true}
                    chartConfig={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backgroundGradientFrom: 'rgba(0, 0, 0, 0.5)',
                        backgroundGradientTo: 'rgba(0, 0, 0, 0.8)',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        barPercentage: 0.7,
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                />
            </View>
        );
    };

    const renderTubeDataValues = (tube: Tube) => {
        if (!tube) return null;
        
        const tubeNames = Object.keys(tube);
        if (tubeNames.length === 0) return null;
        
        const tubeName = tubeNames[0];
        const data = tube[tubeName];
        
        if (!data) return null;
        
        // Get color for the tube background based on RGB values
        const rgbColor = `rgb(${Math.min(255, Math.round(data.R))}, ${Math.min(255, Math.round(data.G))}, ${Math.min(255, Math.round(data.B))})`;
        
        // Determine if text should be light or dark based on background
        const brightness = (data.R * 299 + data.G * 587 + data.B * 114) / 1000;
        const textColor = brightness > 128 ? 'black' : 'white';
        
        return (
            <View 
                key={tubeName} 
                style={[styles.tubeContainer, { backgroundColor: rgbColor }]}
            >
                <ThemedText style={[styles.tubeName, { color: textColor }]}>{tubeName}</ThemedText>
                <View style={styles.rgbContainer}>
                    <ThemedText style={{ color: textColor }}>R: {data.R.toFixed(1)}</ThemedText>
                    <ThemedText style={{ color: textColor }}>G: {data.G.toFixed(1)}</ThemedText>
                    <ThemedText style={{ color: textColor }}>B: {data.B.toFixed(1)}</ThemedText>
                </View>
            </View>
        );
    };

    const renderRow = (rowData: Tube[] | undefined, rowName: string) => {
        // Safety check
        if (!rowData || !Array.isArray(rowData)) {
            console.error(`Row data for ${rowName} is not valid:`, rowData);
            return (
                <View key={rowName} style={styles.rowContainer}>
                    <ThemedText lightColor="white" style={styles.rowName}>{rowName}</ThemedText>
                    <View style={styles.errorRow}>
                        <ThemedText lightColor="white">Invalid data format for this row</ThemedText>
                    </View>
                </View>
            );
        }

        return (
            <View key={rowName} style={styles.rowContainer}>
                <ThemedText lightColor="white" style={styles.rowName}>{rowName}</ThemedText>
                
                {viewMode === 'chart' ? (
                    renderBarChart(rowData, rowName)
                ) : (
                    <View style={styles.tubesGrid}>
                        {rowData.map((tube, index) => (
                            <View key={index}>{renderTubeDataValues(tube)}</View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    // Debug output for parsedData
    useEffect(() => {
        if (parsedData) {
            console.log("First row keys:", Object.keys(parsedData));
            if ('Row1' in parsedData) {
                console.log("Row1 type:", Array.isArray(parsedData.Row1) ? "Array" : typeof parsedData.Row1);
                console.log("Row1 length:", Array.isArray(parsedData.Row1) ? parsedData.Row1.length : "N/A");
            }
        }
    }, [parsedData]);

    // Render error state
    if (error) {
        return (
            <ImageBackground source={require('@/assets/images/bg-home.png')} style={{ width: '100%', height: '100%'}} resizeMode='cover'>
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
                <View style={styles.errorContainer}>
                    <ThemedText lightColor="white" style={styles.errorText}>{error}</ThemedText>
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

    return (
        <ImageBackground source={require('@/assets/images/bg-home.png')} style={{ width: '100%', height: '100%'}} resizeMode='cover'>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.contentContainer}>
                    <ThemedText lightColor="white" style={styles.title}>
                        Fluorescence Analysis
                    </ThemedText>
                    
                    {/* View Mode Toggle */}
                    <View style={styles.viewModeContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.viewModeButton, 
                                viewMode === 'values' && styles.activeViewMode
                            ]} 
                            onPress={() => setViewMode('values')}
                        >
                            <ThemedText lightColor="white">Values</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.viewModeButton, 
                                viewMode === 'chart' && styles.activeViewMode
                            ]} 
                            onPress={() => setViewMode('chart')}
                        >
                            <ThemedText lightColor="white">Chart</ThemedText>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Color Selection - Only show in chart mode */}
                    {viewMode === 'chart' && (
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
                    )}
                    
                    {/* Results Display */}
                    {parsedData ? (
                        <View>
                            {Object.entries(parsedData).map(([rowName, rowData]) => renderRow(rowData, rowName))}
                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <ThemedText lightColor="white">Loading results...</ThemedText>
                        </View>
                    )}
                </View>
            </ScrollView>
            
            {/* Bottom Navigation */}
            <View style={styles.buttonContainer}>
                <ActionButton 
                    icon="house.fill" 
                    title="Home" 
                    color='rgba(13, 235, 204, 0.7)'
                    onPress={() => router.push('/')} 
                />
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
    contentContainer: {
        padding: 20,
        gap: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    viewModeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    viewModeButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(100, 100, 100, 0.5)',
        width: 120,
        alignItems: 'center',
    },
    activeViewMode: {
        backgroundColor: 'rgba(0, 150, 255, 0.7)',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    rowName: {
        fontSize: 18,
        marginBottom: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingVertical: 6,
        borderRadius: 4,
    },
    errorRow: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 8,
    },
    chartContainer: {
        marginVertical: 8,
        alignItems: 'center',
    },
    chartError: {
        height: 220,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 8,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    tubesGrid: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: 8,
        alignItems: 'center',
    },
    tubeContainer: {
        borderRadius: 8,
        padding: 8,
        width: '48%',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    tubeName: {
        fontSize: 16,
        marginBottom: 4,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    rgbContainer: {
        gap: 4,
    },
    buttonContainer: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
});