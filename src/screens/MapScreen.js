import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

// Google Maps Standard Style (Raster)
const GOOGLE_MAPS_STYLE = {
    version: 8,
    sources: {
        google_streets: {
            type: 'raster',
            tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'],
            tileSize: 256,
            attribution: 'Map data &copy; Google',
            maxzoom: 20,
        },
    },
    layers: [
        {
            "id": "google_streets",
            "type": "raster",
            "source": "google_streets",
        },
    ],
};

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [permissionResponse, requestPermission] = Location.useForegroundPermissions();
    const [route, setRoute] = useState(null);

    useEffect(() => {
        (async () => {
            if (!permissionResponse?.granted) {
                const { status } = await requestPermission();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Location permission is required to show your position.');
                    return;
                }
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation([loc.coords.longitude, loc.coords.latitude]);
        })();
    }, [permissionResponse]);

    const onMapPress = async (feature) => {
        if (!location) return;

        const [destLon, destLat] = feature.geometry.coordinates;
        const [startLon, startLat] = location;

        // Fetch route from OSRM (Demo server - limited usage!)
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
            }
        } catch (error) {
            console.error('Routing error:', error);
            Alert.alert('Error', 'Could not scale route.');
        }
    };

    return (
        <View style={styles.page}>
            <MapLibreGL.MapView
                style={styles.map}
                styleJSON={JSON.stringify(GOOGLE_MAPS_STYLE)}
                logoEnabled={false}
                onPress={onMapPress}
            >
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
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (location) {
                            // Center map logic could be added here referencing a ref
                            Alert.alert("Info", `Lat: ${location[1].toFixed(4)}, Lon: ${location[0].toFixed(4)}`)
                        }
                    }}
                >
                    <Text style={styles.buttonText}>{location ? "Show Info" : "Locating..."}</Text>
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
});
