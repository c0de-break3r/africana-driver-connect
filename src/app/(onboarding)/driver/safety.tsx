import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { OnboardingOptionRow } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const VIOLATION_OPTIONS = [
  { value: "no", label: "Clean driving record" },
  { value: "yes", label: "I have recent violations" },
];

export default function SafetyScreen() {
  const {
    insuranceProvider,
    insurancePolicyNumber,
    insuranceExpiryDate,
    roadworthinessCertDate,
    hasRecentViolations,
    violationDetails,
    setSafetyInfo,
    setStep,
  } = useDriverOnboardingStore();

  const [provider, setProvider] = useState(insuranceProvider);
  const [policyNumber, setPolicyNumber] = useState(insurancePolicyNumber);
  const [insuranceExpiry, setInsuranceExpiry] = useState(insuranceExpiryDate);
  const [roadworthy, setRoadworthy] = useState(roadworthinessCertDate);
  const [violations, setViolations] = useState<boolean | null>(
    hasRecentViolations,
  );
  const [details, setDetails] = useState(violationDetails);

  const canContinue =
    provider.trim().length > 0 &&
    policyNumber.trim().length > 0 &&
    insuranceExpiry.trim().length > 0 &&
    roadworthy.trim().length > 0 &&
    violations !== null &&
    (violations === false || details.trim().length > 0);

  const handleContinue = () => {
    if (!canContinue) return;
    setSafetyInfo(
      provider.trim(),
      policyNumber.trim(),
      insuranceExpiry.trim(),
      roadworthy.trim(),
      violations!,
      details.trim(),
    );
    setStep(13);
    router.push("/(onboarding)/driver/payout" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={13}
      title="Safety & compliance"
      description="Insurance and roadworthiness details help build trust with clients."
      buttonDisabled={!canContinue}
      onContinue={handleContinue}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <Text style={styles.heading}>Vehicle insurance</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Insurance provider</Text>
          <TextInput
            value={provider}
            onChangeText={setProvider}
            placeholder="e.g. SIC Insurance"
            placeholderTextColor="#A0AAB4"
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfField]}>
            <Text style={styles.label}>Policy number</Text>
            <TextInput
              value={policyNumber}
              onChangeText={setPolicyNumber}
              placeholder="Policy #"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfField]}>
            <Text style={styles.label}>Expiry date</Text>
            <TextInput
              value={insuranceExpiry}
              onChangeText={setInsuranceExpiry}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.heading}>Roadworthiness</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last inspection date</Text>
          <TextInput
            value={roadworthy}
            onChangeText={setRoadworthy}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#A0AAB4"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.heading}>Driving record</Text>

        <View style={styles.cardsList}>
          {VIOLATION_OPTIONS.map((option, index) => {
            const isSelected =
              (option.value === "no" && violations === false) ||
              (option.value === "yes" && violations === true);
            return (
              <OnboardingOptionRow
                key={option.value}
                title={option.label}
                selected={isSelected}
                isLast={index === VIOLATION_OPTIONS.length - 1}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setViolations(option.value === "yes");
                }}
              />
            );
          })}
        </View>

        {violations === true && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Please describe the violations</Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Briefly describe any recent traffic violations"
              placeholderTextColor="#A0AAB4"
              style={styles.textarea}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
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
  heading: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 16,
    marginTop: 8,
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
  textarea: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E5B",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8ECF0",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 80,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  cardsList: {
    marginBottom: 16,
  },
});
