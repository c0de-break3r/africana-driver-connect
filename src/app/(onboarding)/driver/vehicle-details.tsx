import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { OnboardingOptionRow } from "@/components/ui";
import {
    useDriverOnboardingStore,
    type VehicleOwnership,
} from "@/store/useDriverOnboardingStore";

const OWNERSHIP_OPTIONS = [
  { value: "own", label: "I own the vehicle" },
  { value: "lease", label: "Leased vehicle" },
  { value: "company", label: "Company vehicle" },
  { value: "other", label: "Other" },
];

export default function VehicleDetailsScreen() {
  const {
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehiclePlateNumber,
    vehicleOwnership,
    ownerConsentObtained,
    setVehicleDetails,
    setStep,
  } = useDriverOnboardingStore();

  const [make, setMake] = useState(vehicleMake);
  const [model, setModel] = useState(vehicleModel);
  const [year, setYear] = useState(vehicleYear);
  const [plate, setPlate] = useState(vehiclePlateNumber);
  const [ownership, setOwnership] = useState<VehicleOwnership | null>(
    vehicleOwnership,
  );
  const [consent, setConsent] = useState(ownerConsentObtained);

  const needsConsent = ownership === "lease" || ownership === "other";

  const canContinue =
    make.trim().length > 0 &&
    model.trim().length > 0 &&
    year.trim().length > 0 &&
    plate.trim().length > 0 &&
    ownership !== null &&
    (!needsConsent || consent);

  const handleContinue = () => {
    if (!canContinue || !ownership) return;
    setVehicleDetails(
      make.trim(),
      model.trim(),
      year.trim(),
      plate.trim(),
      ownership,
      needsConsent ? consent : false,
    );
    setStep(10);
    router.push("/(onboarding)/driver/job-type" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={10}
      title="Your vehicle details"
      description="Tell us about the primary vehicle you'll use for driving."
      buttonDisabled={!canContinue}
      onContinue={handleContinue}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfField]}>
            <Text style={styles.label}>Make</Text>
            <TextInput
              value={make}
              onChangeText={setMake}
              placeholder="e.g. Toyota"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfField]}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Corolla"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfField]}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              placeholder="e.g. 2020"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfField]}>
            <Text style={styles.label}>Plate number</Text>
            <TextInput
              value={plate}
              onChangeText={setPlate}
              placeholder="e.g. GR-1234-20"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Vehicle ownership</Text>
        <View style={styles.cardsList}>
          {OWNERSHIP_OPTIONS.map((option, index) => (
            <OnboardingOptionRow
              key={option.value}
              title={option.label}
              selected={ownership === option.value}
              isLast={index === OWNERSHIP_OPTIONS.length - 1}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOwnership(option.value as VehicleOwnership);
              }}
            />
          ))}
        </View>

        {needsConsent && (
          <Pressable
            style={styles.consentRow}
            onPress={() => setConsent(!consent)}
          >
            <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
              {consent && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.consentText}>
              I have the owner&apos;s written consent to use this vehicle for
              commercial purposes
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </DriverStepShell>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    flex: 1,
    marginTop: 24,
  },
  formContent: {
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
    marginBottom: 8,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
    marginBottom: 12,
  },
  cardsList: {
    marginBottom: 16,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
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
  },
  checkboxChecked: {
    backgroundColor: "#2C3E5B",
    borderColor: "#2C3E5B",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    color: "#2C3E5B",
    lineHeight: 20,
  },
});
