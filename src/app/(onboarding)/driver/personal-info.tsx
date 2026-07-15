import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { OnboardingOptionRow } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const CRIMINAL_OPTIONS = [
  { value: "no", label: "No criminal record" },
  { value: "yes", label: "I have a record" },
];

export default function PersonalInfoScreen() {
  const {
    residentialAddress,
    hasCriminalRecord,
    criminalRecordDetails,
    extractedIdData,
    setPersonalInfo,
    setStep,
  } = useDriverOnboardingStore();

  // Auto-fill address from extracted ID data if available
  const [address, setAddress] = useState(
    residentialAddress || extractedIdData?.address || "",
  );
  const [criminal, setCriminal] = useState<boolean | null>(hasCriminalRecord);
  const [details, setDetails] = useState(criminalRecordDetails);

  const canContinue =
    address.trim().length > 0 &&
    criminal !== null &&
    (criminal === false || details.trim().length > 0);

  const handleContinue = () => {
    if (!canContinue) return;
    setPersonalInfo(address.trim(), criminal!, details.trim());
    setStep(7);
    router.push("/(onboarding)/driver/license" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={7}
      title="Tell us about yourself"
      description="We need your residential address and a quick background check declaration."
      buttonDisabled={!canContinue}
      onContinue={handleContinue}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Residential address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Your current address"
            placeholderTextColor="#A0AAB4"
            style={styles.input}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.sectionLabel}>Criminal history declaration</Text>
        <View style={styles.cardsList}>
          {CRIMINAL_OPTIONS.map((option, index) => {
            const isSelected =
              (option.value === "no" && criminal === false) ||
              (option.value === "yes" && criminal === true);
            return (
              <OnboardingOptionRow
                key={option.value}
                title={option.label}
                selected={isSelected}
                isLast={index === CRIMINAL_OPTIONS.length - 1}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCriminal(option.value === "yes");
                }}
              />
            );
          })}
        </View>

        {criminal === true && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Please provide details</Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Briefly describe the nature of the record"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
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
    minHeight: 80,
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
});
