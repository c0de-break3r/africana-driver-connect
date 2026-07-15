import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

export default function PreferredLocationScreen() {
  const { preferredLocation, setPreferredLocation, setStep } =
    useDriverOnboardingStore();
  const [location, setLocation] = useState(preferredLocation);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      const { latitude, longitude } = position.coords;

      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const address = addresses[0];
      const label = address
        ? [address.city, address.region, address.country]
            .filter(Boolean)
            .join(", ")
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      setLocation(label);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleContinue = () => {
    if (!location.trim()) return;
    setPreferredLocation(location.trim());
    setStep(12);
    router.push("/(onboarding)/driver/safety" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={12}
      title="Where do you want to work?"
      description="Set your preferred work area so we can show nearby opportunities."
      buttonDisabled={!location.trim()}
      onContinue={handleContinue}
    >
      <View style={styles.form}>
        <Pressable
          style={styles.locationButton}
          onPress={handleUseCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#2C3E5B" />
          ) : (
            <Text style={styles.locationButtonText}>
              Use my current location
            </Text>
          )}
        </Pressable>

        <Text style={styles.orText}>or enter manually</Text>

        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="City or area"
          placeholderTextColor="#A0AAB4"
          style={styles.input}
        />
      </View>
    </DriverStepShell>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    flex: 1,
    marginTop: 24,
  },
  locationButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2C3E5B",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  orText: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    marginVertical: 16,
  },
  input: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E5B",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8ECF0",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});
