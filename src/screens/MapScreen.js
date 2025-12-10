import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Image, TextInput, Keyboard } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Import Theme Context
import { StyleSheet, View, Text, TouchableOpacity, Alert, Image, TextInput, Keyboard } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

// Standard OSM Raster Style
// Standard OSM Raster Style (Via German Server to avoid blocking)
const OSM_DE_STYLE = {
    version: 8,
    sources: {
        osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.de/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19,
        },
    },
    layers: [
        {
            "id": "osm",
            "type": "raster",
            "source": "osm",
        },
    ],
};

export default function MapScreen() {
    const { colors, theme } = useTheme(); // Use Theme
    const [location, setLocation] = useState(null);
    const [speed, setSpeed] = useState(0); // Speed State
    const [permissionResponse, requestPermission] = Location.useForegroundPermissions();
    const [route, setRoute] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        (async () => {
            // 1. Request Permission
            if (!permissionResponse?.granted) {
                const { status } = await requestPermission();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Location permission is required to show your position.');
                    return;
                }
            }
            // 2. Get Current Location (and watch for updates)
            try {
                // Initial fetch
                const loc = await Location.getCurrentPositionAsync({});
                setLocation([loc.coords.longitude, loc.coords.latitude]);

                // Watch for changes (for speedometer)
                await Location.watchPositionAsync({
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 5,
                }, (newLoc) => {
                    setLocation([newLoc.coords.longitude, newLoc.coords.latitude]);
                    // Speed is in m/s, convert to km/h
                    const speedKmh = (newLoc.coords.speed || 0) * 3.6;
                    setSpeed(Math.max(0, speedKmh));
                });

            } catch (e) {
                console.log("Error getting location", e);
            }
        })();
    }, [permissionResponse]);

    const fetchRoute = async (destLon, destLat) => {
        if (!location) {
            Alert.alert("Error", "Waiting for your location...");
            return;
        }
        const [startLon, startLat] = location;

        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full`
            );
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const geometry = data.routes[0].geometry;
                const decoded = polyline.decode(geometry);
                // Polyline decodes to [lat, lon], we need [lon, lat] for GeoJSON
                const coordinates = decoded.map(([lat, lon]) => [lon, lat]);

                setRoute({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates,
                    },
                });
            } else {
                Alert.alert('Route Error', 'No route found.');
            }
        } catch (error) {
            console.error('Routing error:', error);
            Alert.alert('Error', 'Could not calc route.');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        Keyboard.dismiss();
        setIsSearching(true);

        try {
            // Geocoding using Nominatim
            // IMPORTANT: User-Agent is required by OSM Nominatim policy
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
                {
                    headers: {
                        'User-Agent': 'BikeOS/1.0',
                    },
                }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                const destLon = parseFloat(result.lon);
                const destLat = parseFloat(result.lat);

                await fetchRoute(destLon, destLat);
                Alert.alert('Route Found', `Navigating to: ${result.display_name}`);
            } else {
                Alert.alert('Not Found', 'Could not find that location.');
            }
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const onMapPress = async (feature) => {
        if (!feature.geometry) return;
        const [destLon, destLat] = feature.geometry.coordinates;
        await fetchRoute(destLon, destLat);
    };

    return (
        <View style={styles.page}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border
                    }]}
                    placeholder="Where to? (e.g. Hauptbahnhof)"
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                    disabled={isSearching}
                >
                    <Text style={styles.searchButtonText}>{isSearching ? "..." : "Go"}</Text>
                </TouchableOpacity>
            </View>

            <MapLibreGL.MapView
                style={styles.map}
                styleJSON={JSON.stringify(OSM_DE_STYLE)}
                logoEnabled={false}
                onPress={onMapPress}
            >
                {/* Dark Mode Overlay for Map */}
                {theme === 'dark' && <View style={styles.darkOverlay} pointerEvents="none" />}
                <MapLibreGL.Camera
                    zoomLevel={14}
                    centerCoordinate={location || [13.405, 52.52]} // Default to Berlin if no location
                    followUserLocation={!!location}
                    followUserMode="normal"
                />

                {/* User Location Puck */}
                <MapLibreGL.UserLocation visible={true} />

                {/* Route Line */}
                {route && (
                    <MapLibreGL.ShapeSource id="routeSource" shape={route}>
                        <MapLibreGL.LineLayer
                            id="routeFill"
                            style={{
                                lineColor: '#38bdf8', // Sky 400
                                lineWidth: 5,
                                lineCap: 'round',
                                lineJoin: 'round',
                            }}
                        />
                    </MapLibreGL.ShapeSource>
                )}
            </MapLibreGL.MapView>

            <View style={styles.overlay}>
                <View style={[styles.speedContainer, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                    <Text style={[styles.speedText, { color: colors.text }]}>{speed.toFixed(0)}</Text>
                    <Text style={[styles.unitText, { color: '#94a3b8' }]}>km/h</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.card, borderColor: colors.primary }]}
                    onPress={() => {
                        if (location) {
                            Alert.alert("Info", `Lat: ${location[1].toFixed(4)}, Lon: ${location[0].toFixed(4)}`)
                        } else {
                            Alert.alert("Info", "Waiting for location...");
                        }
                    }}
                >
                    <Text style={[styles.buttonText, { color: colors.primary }]}>{location ? "Info" : "..."}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        zIndex: 10,
        flexDirection: 'row',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#1e293b', // Slate 800
        color: '#f8fafc',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        fontSize: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchButton: {
        backgroundColor: '#38bdf8',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        shadowColor: "#38bdf8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchButtonText: {
        color: '#0f172a',
        fontWeight: 'bold',
        fontSize: 16,
    },
    overlay: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
        pointerEvents: 'box-none'
    },
    button: {
        backgroundColor: '#0f172a',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#38bdf8',
    },
    buttonText: {
        color: '#38bdf8',
        fontWeight: '600'
    }
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', // Dim the bright OSM map in dark mode
        zIndex: 1,
    },
    speedContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10, // above button
        minWidth: 100,
    },
    speedText: {
        fontSize: 32,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    unitText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    }
});
