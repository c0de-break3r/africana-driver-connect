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
import {
    useDriverOnboardingStore,
    type LicenseClass,
} from "@/store/useDriverOnboardingStore";

const LICENSE_CLASSES: {
  key: LicenseClass;
  title: string;
  description: string;
}[] = [
  {
    key: "A",
    title: "Class A \u2014 Motorcycles",
    description: "Motorcycles, mopeds, and tricycles",
  },
  {
    key: "B",
    title: "Class B \u2014 Private / Commercial",
    description:
      "Cars, pickups, minibuses (1\u201315 passengers, max 5,000 kg)",
  },
  {
    key: "C",
    title: "Class C \u2014 Medium passenger",
    description: "Coasters and buses (16\u201345 passengers)",
  },
  {
    key: "D",
    title: "Class D \u2014 Heavy passenger",
    description: "Large buses and VIP coaches (up to 65 passengers)",
  },
  {
    key: "E",
    title: "Class E \u2014 Industrial & agricultural",
    description: "Forklifts, bulldozers, excavators, tractors",
  },
  {
    key: "F",
    title: "Class F \u2014 Heavy cargo",
    description: "Articulated trucks, rigid vehicles, long trailers",
  },
];

export default function LicenseVerificationScreen() {
  const {
    fullLegalName,
    dateOfBirth,
    licenseClass,
    licenseNumber,
    licenseExpiryDate,
    extractedIdData,
    extractedLicenseData,
    setLicenseInfo,
    setLicenseDetails,
    setStep,
  } = useDriverOnboardingStore();

  // Auto-fill from extracted verification data if available
  const [name, setName] = useState(
    fullLegalName ||
      extractedIdData?.fullName ||
      extractedLicenseData?.fullName ||
      "",
  );
  const [dob, setDob] = useState(
    dateOfBirth ||
      extractedIdData?.dateOfBirth ||
      extractedLicenseData?.dateOfBirth ||
      "",
  );
  const [selectedClass, setSelectedClass] = useState<LicenseClass | null>(
    licenseClass ||
      (extractedLicenseData?.licenseClass as LicenseClass) ||
      null,
  );
  const [licNumber, setLicNumber] = useState(
    licenseNumber || extractedLicenseData?.licenseNumber || "",
  );
  const [expiry, setExpiry] = useState(
    licenseExpiryDate || extractedLicenseData?.expiryDate || "",
  );

  const handleContinue = () => {
    if (!name.trim() || !dob.trim() || !selectedClass) return;
    setLicenseInfo(name.trim(), dob.trim(), selectedClass);
    setLicenseDetails(licNumber.trim(), expiry.trim());
    setStep(8);
    router.push("/(onboarding)/driver/vehicle" as Href);
  };

  const canContinue =
    name.trim().length > 0 && dob.trim().length > 0 && selectedClass !== null;

  return (
    <DriverStepShell
      stepIndex={8}
      title="Your driver's license"
      description="We'll use this to match you with the right jobs and keep everyone safe."
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
          <Text style={styles.label}>Full legal name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="As it appears on your Ghana Card"
            placeholderTextColor="#A0AAB4"
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            value={dob}
            onChangeText={setDob}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#A0AAB4"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfField]}>
            <Text style={styles.label}>License number</Text>
            <TextInput
              value={licNumber}
              onChangeText={setLicNumber}
              placeholder="e.g. DVLA-123456"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfField]}>
            <Text style={styles.label}>Expiry date</Text>
            <TextInput
              value={expiry}
              onChangeText={setExpiry}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#A0AAB4"
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>License class</Text>
        <View style={styles.cardsList}>
          {LICENSE_CLASSES.map((item) => {
            const isSelected = selectedClass === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedClass(item.key);
                }}
              >
                <View
                  style={[
                    styles.card,
                    isSelected ? styles.cardSelected : styles.cardDefault,
                  ]}
                >
                  <Text
                    style={[
                      styles.cardTitle,
                      isSelected && styles.cardTitleSelected,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {selectedClass === "A" && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Class A is for motorcycles only. Most ride-hailing and passenger
              jobs require Class B or higher.
            </Text>
          </View>
        )}

        {selectedClass === "B" && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Class B covers up to 15 passengers. For larger buses or commercial
              ride-hailing, you may need Class C.
            </Text>
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
    gap: 12,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
  },
  cardDefault: {
    borderColor: "#E8ECF0",
  },
  cardSelected: {
    borderColor: "#2C3E5B",
    backgroundColor: "rgba(44, 62, 91, 0.04)",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 4,
  },
  cardTitleSelected: {
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 13,
    color: "#6E7E91",
  },
  warningBox: {
    backgroundColor: "rgba(255, 193, 7, 0.12)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.4)",
  },
  warningText: {
    fontSize: 13,
    color: "#856404",
    lineHeight: 18,
  },
});
