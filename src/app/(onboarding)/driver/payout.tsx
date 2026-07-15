import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { OnboardingOptionRow } from "@/components/ui";
import {
    useDriverOnboardingStore,
    type PayoutMethod,
} from "@/store/useDriverOnboardingStore";

const PAYOUT_OPTIONS = [
  { value: "momo", label: "Mobile Money (MoMo)" },
  { value: "bank", label: "Bank Transfer" },
];

export default function PayoutScreen() {
  const {
    payoutMethod,
    payoutAccountName,
    payoutAccountNumber,
    taxIdentificationNumber,
    setPayoutInfo,
    setStep,
  } = useDriverOnboardingStore();

  const [method, setMethod] = useState<PayoutMethod | null>(payoutMethod);
  const [accountName, setAccountName] = useState(payoutAccountName);
  const [accountNumber, setAccountNumber] = useState(payoutAccountNumber);
  const [tin, setTin] = useState(taxIdentificationNumber);

  const isMomo = method === "momo";

  const canContinue =
    method !== null &&
    accountName.trim().length > 0 &&
    accountNumber.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue || !method) return;
    setPayoutInfo(method, accountName.trim(), accountNumber.trim(), tin.trim());
    setStep(14);
    router.push("/(onboarding)/driver/otp" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={14}
      title="How should we pay you?"
      description="Choose your preferred payout method so earnings reach you quickly."
      buttonDisabled={!canContinue}
      onContinue={handleContinue}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <Text style={styles.sectionLabel}>Payout method</Text>
        <View style={styles.cardsList}>
          {PAYOUT_OPTIONS.map((option, index) => (
            <OnboardingOptionRow
              key={option.value}
              title={option.label}
              selected={method === option.value}
              isLast={index === PAYOUT_OPTIONS.length - 1}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMethod(option.value as PayoutMethod);
              }}
            />
          ))}
        </View>

        {method && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account name</Text>
              <TextInput
                value={accountName}
                onChangeText={setAccountName}
                placeholder="Name on the account"
                placeholderTextColor="#A0AAB4"
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {isMomo ? "MoMo number" : "Bank account number"}
              </Text>
              <TextInput
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder={isMomo ? "e.g. 0244000000" : "Account number"}
                placeholderTextColor="#A0AAB4"
                style={styles.input}
                keyboardType={isMomo ? "phone-pad" : "numeric"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tax Identification Number{" "}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                value={tin}
                onChangeText={setTin}
                placeholder="TIN"
                placeholderTextColor="#A0AAB4"
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
          </>
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
    marginBottom: 12,
  },
  cardsList: {
    marginBottom: 20,
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
  optional: {
    fontWeight: "400",
    color: "#A0AAB4",
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
