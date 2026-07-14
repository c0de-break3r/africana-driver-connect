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
    key: "B",
    title: "Class B — Private",
    description: "Private vehicles only",
  },
  {
    key: "C",
    title: "Class C — Commercial passenger",
    description: "Required for ride-hailing",
  },
  {
    key: "D",
    title: "Class D — Heavy goods",
    description: "Trucks and heavy cargo",
  },
  {
    key: "E",
    title: "Class E — Agricultural & industrial",
    description: "Specialized machinery",
  },
];

export default function LicenseVerificationScreen() {
  const {
    fullLegalName,
    dateOfBirth,
    licenseClass,
    setLicenseInfo,
    setStep,
    setLicenseVerificationResult,
  } = useDriverOnboardingStore();

  const [name, setName] = useState(fullLegalName);
  const [dob, setDob] = useState(dateOfBirth);
  const [selectedClass, setSelectedClass] = useState<LicenseClass | null>(
    licenseClass,
  );

  const handleContinue = () => {
    if (!name.trim() || !dob.trim() || !selectedClass) return;
    setLicenseInfo(name.trim(), dob.trim(), selectedClass);
    setLicenseVerificationResult("in_progress");
    setStep(4);
    router.push("/(onboarding)/driver/license-verify" as Href);
  };

  const canContinue =
    name.trim().length > 0 && dob.trim().length > 0 && selectedClass !== null;

  return (
    <DriverStepShell
      stepIndex={3}
      title="Let's verify who you are"
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

        {selectedClass === "B" && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Most jobs on Africana Driver Connect require Class C. You can
              continue and upgrade your license later.
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
