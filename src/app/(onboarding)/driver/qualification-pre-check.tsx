import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { PrimaryButton, ScreenContainer } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

type VehicleType = "sedan" | "van";

const VEHICLE_OPTIONS: { value: VehicleType; icon: string; label: string }[] = [
  { value: "sedan", icon: "🚗", label: "Sedan/Saloon" },
  { value: "van", icon: "🚚", label: "Delivery Van" },
];

const REQUIREMENTS: Record<
  VehicleType,
  { license: string; licenseClass: string; ghanaCard: string }
> = {
  sedan: {
    license: "I have a valid Class B (or higher) Driver's License.",
    licenseClass: "Class B+",
    ghanaCard: "I have an active Ghana Card.",
  },
  van: {
    license: "I have a valid Class C (or higher) Driver's License.",
    licenseClass: "Class C+",
    ghanaCard: "I have an active Ghana Card.",
  },
};

export default function QualificationPreCheckScreen() {
  const { setQualificationPreCheck, setStep } = useDriverOnboardingStore();

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(
    null
  );
  const [hasValidLicense, setHasValidLicense] = useState(false);
  const [hasActiveGhanaCard, setHasActiveGhanaCard] = useState(false);

  const canContinue =
    selectedVehicle !== null && hasValidLicense && hasActiveGhanaCard;

  const handleVehicleSelect = (vehicle: VehicleType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVehicle(vehicle);
    // Reset checkboxes when vehicle changes
    setHasValidLicense(false);
    setHasActiveGhanaCard(false);
  };

  const handleContinue = () => {
    if (!canContinue || !selectedVehicle) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setQualificationPreCheck(selectedVehicle, hasValidLicense, hasActiveGhanaCard);
    setStep(3);
    router.push("/(onboarding)/driver/employment" as Href);
  };

  const requirements = selectedVehicle ? REQUIREMENTS[selectedVehicle] : null;

  return (
    <ScreenContainer>
      <DriverStepShell
        stepIndex={1}
        title="Choose Your Vehicle"
        description="Select how you want to deliver or drive on the platform."
        buttonTitle="Continue to Dashboard →"
        buttonDisabled={!canContinue}
        onContinue={handleContinue}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Vehicle Selection ── */}
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <View style={styles.pillContainer}>
            {VEHICLE_OPTIONS.map((option, index) => (
              <Pressable
                key={option.value}
                style={[
                  styles.pill,
                  selectedVehicle === option.value && styles.pillSelected,
                ]}
                onPress={() => handleVehicleSelect(option.value)}
              >
                <Text style={styles.pillIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.pillLabel,
                    selectedVehicle === option.value && styles.pillLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Requirements ── */}
          {requirements && (
            <View style={styles.requirementsBox}>
              <Pressable
                style={styles.checkboxWrapper}
                onPress={() => setHasValidLicense(!hasValidLicense)}
              >
                <View
                  style={[
                    styles.checkbox,
                    hasValidLicense && styles.checkboxChecked,
                  ]}
                >
                  {hasValidLicense && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  {requirements.license}
                </Text>
              </Pressable>

              <Pressable
                style={styles.checkboxWrapper}
                onPress={() => setHasActiveGhanaCard(!hasActiveGhanaCard)}
              >
                <View
                  style={[
                    styles.checkbox,
                    hasActiveGhanaCard && styles.checkboxChecked,
                  ]}
                >
                  {hasActiveGhanaCard && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  {requirements.ghanaCard}
                </Text>
              </Pressable>

              {!hasValidLicense || !hasActiveGhanaCard ? (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    An active Ghana Card and a matching DVLA license class are
                    required to move forward.
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {!selectedVehicle && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Select a vehicle type above to see requirements.
              </Text>
            </View>
          )}
        </ScrollView>
      </DriverStepShell>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  pillContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8ECF0",
    backgroundColor: "#FFFFFF",
  },
  pillSelected: {
    borderColor: "#2C3E5B",
    backgroundColor: "rgba(44, 62, 91, 0.06)",
  },
  pillIcon: {
    fontSize: 24,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  pillLabelSelected: {
    color: "#2C3E5B",
  },
  requirementsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    marginBottom: 16,
  },
  requirementRow: {
    marginBottom: 16,
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E8ECF0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: "#2C3E5B",
    borderColor: "#2C3E5B",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#2C3E5B",
    lineHeight: 22,
    flex: 1,
  },
  warningBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FFB300",
  },
  warningText: {
    fontSize: 13,
    color: "#8D6E00",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
});