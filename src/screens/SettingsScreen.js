import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
    const { theme, toggleTheme, colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionHeader, { color: colors.primary }]}>Appearance</Text>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ true: colors.primary, false: '#767577' }}
                        thumbColor={'#fff'}
                    />
                </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionHeader, { color: colors.primary }]}>Account</Text>
                <TouchableOpacity style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>Edit Profile</Text>
                    <Text style={{ color: '#94a3b8' }}>></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>Ride History</Text>
                    <Text style={{ color: '#94a3b8' }}>></Text>
                </TouchableOpacity>
            </View>

            <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>BikeOS v1.1.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    section: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 16,
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    }
});
