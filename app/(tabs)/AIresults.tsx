import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ActionButton from '@/components/ui/ActionButton';
import { BarChart } from 'react-native-chart-kit';
import { useState, useEffect } from 'react';

interface RGB {
  R: number;
  G: number;
  B: number;
}

interface TubeData {
  Color: string;
  RGB: RGB;
}

interface Tube {
  [key: string]: TubeData;
}

interface RowData {
  [key: string]: Tube[];
}

type ColorType = 'R' | 'G' | 'B';
type ViewMode = 'values' | 'chart';

export default function AIResults() {
    const router = useRouter();
    const params = useLocalSearchParams<{ result: string }>();
    const [selectedColor, setSelectedColor] = useState<ColorType>('R');
    const [viewMode, setViewMode] = useState<ViewMode>('values');
    const [parsedData, setParsedData] = useState<RowData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (params.result) {
            try {
                const resultObj = JSON.parse(params.result);
                console.log("Parsed result object:", resultObj);
                
                if (resultObj && typeof resultObj === 'object' && 'Row1' in resultObj) {
                    console.log("Using resultObj directly as it contains Row1");
                    setParsedData(resultObj);
                } 
                else if (resultObj && resultObj.result_json && typeof resultObj.result_json === 'object') {
                    console.log("Using result_json which is already an object");
                    setParsedData(resultObj.result_json);
                } 
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
            
            if (tubeData && tubeData.RGB && typeof tubeData.RGB === 'object') {
                return tubeData.RGB[selectedColor] || 0;
            } else if (tubeData && selectedColor in tubeData && typeof tubeData[selectedColor] === 'number') {
                return tubeData[selectedColor];
            }
            return 0;
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
        if (!rowData || !Array.isArray(rowData) || rowData.length === 0) {
            return (
                <View style={styles.chartError}>
                    <ThemedText>No data available for chart</ThemedText>
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
                        backgroundColor: '#f8f9fa',
                        backgroundGradientFrom: '#f8f9fa',
                        backgroundGradientTo: '#f8f9fa',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
        
        let r = 0, g = 0, b = 0, colorName = "";
        
        if (data.RGB && typeof data.RGB === 'object') {
            r = Math.min(255, Math.round(data.RGB.R || 0));
            g = Math.min(255, Math.round(data.RGB.G || 0));
            b = Math.min(255, Math.round(data.RGB.B || 0));
            colorName = data.Color || "";
        } else if (data.RGB && typeof data.RGB.R === 'number' && typeof data.RGB.G === 'number' && typeof data.RGB.B === 'number') {
            r = Math.min(255, Math.round(data.R));
            g = Math.min(255, Math.round(data.G));
            b = Math.min(255, Math.round(data.B));
        }
        
        const rgbColor = `rgb(${r}, ${g}, ${b})`;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? 'black' : 'white';
        
        return (
            <View 
                key={tubeName} 
                style={[styles.tubeContainer, { backgroundColor: rgbColor }]}
            >
                <ThemedText style={[styles.tubeName, { color: textColor }]}>{tubeName}</ThemedText>
                {colorName && (
                    <ThemedText style={{ color: textColor, textAlign: 'center', marginBottom: 4 }}>
                        Color: {colorName}
                    </ThemedText>
                )}
                <View style={styles.rgbContainer}>
                    <ThemedText style={{ color: textColor }}>R: {r}</ThemedText>
                    <ThemedText style={{ color: textColor }}>G: {g}</ThemedText>
                    <ThemedText style={{ color: textColor }}>B: {b}</ThemedText>
                </View>
            </View>
        );
    };

    const renderRow = (rowData: Tube[] | undefined, rowName: string) => {
        if (!rowData || !Array.isArray(rowData)) {
            console.error(`Row data for ${rowName} is not valid:`, rowData);
            return (
                <View key={rowName} style={styles.rowContainer}>
                    <ThemedText style={styles.rowName}>{rowName}</ThemedText>
                    <View style={styles.errorRow}>
                        <ThemedText>Invalid data format for this row</ThemedText>
                    </View>
                </View>
            );
        }

        return (
            <View key={rowName} style={styles.rowContainer}>
                <ThemedText style={styles.rowName}>{rowName}</ThemedText>
                
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

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
                <ActionButton 
                    icon="arrow.left" 
                    title="Back" 
                    color='rgba(235, 13, 13, 0.7)'
                    onPress={() => router.back()} 
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.contentContainer}>
                    <ThemedText style={styles.title}>
                        AI Fluorescence Analysis
                    </ThemedText>
                    
                    <View style={styles.viewModeContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.viewModeButton, 
                                viewMode === 'values' && styles.activeViewMode
                            ]} 
                            onPress={() => setViewMode('values')}
                        >
                            <ThemedText>Values</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.viewModeButton, 
                                viewMode === 'chart' && styles.activeViewMode
                            ]} 
                            onPress={() => setViewMode('chart')}
                        >
                            <ThemedText>Chart</ThemedText>
                        </TouchableOpacity>
                    </View>
                    
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
                    
                    {parsedData ? (
                        <View>
                            {Object.entries(parsedData).map(([rowName, rowData]) => renderRow(rowData, rowName))}
                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <ThemedText>Loading results...</ThemedText>
                        </View>
                    )}
                </View>
            </ScrollView>
            
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        padding: 20,
        gap: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
        color: '#000',
    },
    viewModeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#e9ecef',
    },
    viewModeButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#e9ecef',
        width: 120,
        alignItems: 'center',
    },
    activeViewMode: {
        backgroundColor: '#0d6efd',
    },
    colorButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
    },
    rowContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    rowName: {
        fontSize: 18,
        marginBottom: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#e9ecef',
        paddingVertical: 6,
        borderRadius: 4,
        color: '#000',
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
        backgroundColor: '#e9ecef',
        borderRadius: 8,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    tubesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    tubeContainer: {
        borderRadius: 8,
        padding: 8,
        width: '48%',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        elevation: 1,
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
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e9ecef',
        borderRadius: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: '#000',
    },
});