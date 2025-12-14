import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import * as Location from "expo-location";
import Weather from "./components/Weather";

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [temperature, setTemperature] = useState(0);
  const [weatherCondition, setWeatherCondition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setIsLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        fetchWeather(location.coords.latitude, location.coords.longitude);
      } catch (e) {
        setError("Error getting location");
        setIsLoading(false);
      }
    })();
  }, []);

  const fetchWeather = (lat, lon) => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=metric`
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.weather && json.main) {
          setTemperature(json.main.temp);
          setWeatherCondition(json.weather[0].main);
          setIsLoading(false);
        } else {
          console.warn("Weather data not found", json);
          setError("Could not fetch weather data");
          setIsLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        setError("Error fetching weather");
        setIsLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Fetching the weather...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubText}>
            Please check your internet connection or location settings.
          </Text>
        </View>
      ) : (
        <Weather weather={weatherCondition} temperature={temperature} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF6AA",
    width: "100%",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFCDD2",
    width: "100%",
    padding: 20,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  errorSubText: {
    color: "#D32F2F",
    fontSize: 16,
    textAlign: "center",
  },
});
