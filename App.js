import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.brand}>Bike OS</Text>
        </View>

        <View style={styles.illustrationContainer}>
          <View style={styles.circle} />
          <View style={[styles.circle, styles.circle2]} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.subtitle}>
            Experience the future of cycling navigation.
          </Text>

          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 24,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#94a3b8', // Slate 400
    fontWeight: '500',
    marginBottom: 8,
  },
  brand: {
    fontSize: 48,
    color: '#38bdf8', // Sky 400
    fontWeight: '800',
    letterSpacing: -1,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  circle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    position: 'absolute',
  },
  circle2: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  footer: {
    alignItems: 'center',
    gap: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1', // Slate 300
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
  button: {
    backgroundColor: '#38bdf8',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
});
