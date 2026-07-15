import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { OnboardingOptionRow } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const OPTIONS = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV / Crossover" },
  { value: "minivan", label: "Minivan" },
  { value: "pickup", label: "Pickup truck" },
  { value: "van", label: "Cargo van" },
  { value: "bus", label: "Bus" },
  { value: "school_bus", label: "School bus" },
  { value: "truck", label: "Box truck" },
  { value: "taxi", label: "Taxi" },
  { value: "luxury", label: "Luxury / Executive vehicle" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "trailer", label: "Trailer / Heavy haul" },
  { value: "heavy_equipment", label: "Heavy equipment" },
];

export default function VehicleExperienceScreen() {
  const { vehicleTypes, toggleVehicleType, setStep } =
    useDriverOnboardingStore();

  const handleContinue = () => {
    if (vehicleTypes.length === 0) return;
    setStep(9);
    router.push("/(onboarding)/driver/vehicle-details" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={9}
      title="What vehicle types can you drive?"
      description="Select all that apply. This helps us recommend the right jobs."
      buttonDisabled={vehicleTypes.length === 0}
      onContinue={handleContinue}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.optionsList}
        contentContainerStyle={styles.optionsContent}
      >
        {OPTIONS.map((option, index) => (
          <OnboardingOptionRow
            key={option.value}
            title={option.label}
            selected={vehicleTypes.includes(option.value)}
            isLast={index === OPTIONS.length - 1}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleVehicleType(option.value);
            }}
          />
        ))}
      </ScrollView>
    </DriverStepShell>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    width: "100%",
    flex: 1,
  },
  optionsContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
