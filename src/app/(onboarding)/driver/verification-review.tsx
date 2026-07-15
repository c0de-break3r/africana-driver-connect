import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

/**
 * Step 6 — Verification Review
 *
 * Shows all captured documents and extracted data for review.
 * The user can edit any extracted field before confirming.
 * After confirmation, the data auto-fills the subsequent screens.
 *
 * Sections:
 * 1. National ID photos (front/back thumbnails)
 * 2. Driver's License photos (front/back thumbnails)
 * 3. Selfie thumbnail + face match result
 * 4. Extracted data (editable) — name, DOB, ID number, address, license details
 */
export default function VerificationReviewScreen() {
  const store = useDriverOnboardingStore();
  const {
    nationalIdFrontUri,
    nationalIdBackUri,
    licenseFrontUri,
    licenseBackUri,
    selfieUri,
    extractedIdData,
    extractedLicenseData,
    faceMatchPassed,
    faceMatchConfidence,
    setExtractedData,
    setVerificationPipelineStatus,
    setStep,
  } = store;

  // Editable extracted data fields
  const [fullName, setFullName] = useState(
    extractedIdData?.fullName || extractedLicenseData?.fullName || "",
  );
  const [dob, setDob] = useState(
    extractedIdData?.dateOfBirth || extractedLicenseData?.dateOfBirth || "",
  );
  const [nationalId, setNationalId] = useState(
    extractedIdData?.nationalIdNumber || "",
  );
  const [address, setAddress] = useState(extractedIdData?.address || "");
  const [licNumber, setLicNumber] = useState(
    extractedLicenseData?.licenseNumber || "",
  );
  const [licClass, setLicClass] = useState(
    extractedLicenseData?.licenseClass || "",
  );
  const [licExpiry, setLicExpiry] = useState(
    extractedLicenseData?.expiryDate || "",
  );
  const [isProcessing] = useState(false);

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save the (potentially edited) extracted data back to the store
    setExtractedData(
      {
        fullName: fullName.trim(),
        dateOfBirth: dob.trim(),
        nationalIdNumber: nationalId.trim(),
        address: address.trim(),
      },
      {
        fullName: fullName.trim(),
        dateOfBirth: dob.trim(),
        licenseNumber: licNumber.trim(),
        licenseClass: licClass.trim(),
        expiryDate: licExpiry.trim(),
      },
    );

    setVerificationPipelineStatus("confirmed");
    setStep(6);
    router.push("/(onboarding)/driver/personal-info" as Href);
  };

  const hasAnyDocuments = nationalIdFrontUri || licenseFrontUri || selfieUri;

  return (
    <DriverStepShell
      stepIndex={6}
      title="Review your verification"
      description="Confirm your documents and extracted information before we proceed."
      buttonTitle="Confirm & Continue"
      buttonDisabled={isProcessing}
      onContinue={handleConfirm}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Document thumbnails ── */}
        {hasAnyDocuments && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Captured Documents</Text>

            {/* National ID */}
            {(nationalIdFrontUri || nationalIdBackUri) && (
              <View style={styles.docGroup}>
                <View style={styles.docLabelRow}>
                  <Ionicons name="card" size={18} color="#2C3E5B" />
                  <Text style={styles.docLabel}>Ghana Card (National ID)</Text>
                </View>
                <View style={styles.docRow}>
                  {nationalIdFrontUri ? (
                    <View style={styles.docThumb}>
                      <Image
                        source={{ uri: nationalIdFrontUri }}
                        style={styles.docImage}
                      />
                      <Text style={styles.docThumbLabel}>Front</Text>
                    </View>
                  ) : null}
                  {nationalIdBackUri ? (
                    <View style={styles.docThumb}>
                      <Image
                        source={{ uri: nationalIdBackUri }}
                        style={styles.docImage}
                      />
                      <Text style={styles.docThumbLabel}>Back</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {/* Driver's License */}
            {(licenseFrontUri || licenseBackUri) && (
              <View style={styles.docGroup}>
                <View style={styles.docLabelRow}>
                  <Ionicons name="car" size={18} color="#2C3E5B" />
                  <Text style={styles.docLabel}>Driver&apos;s License</Text>
                </View>
                <View style={styles.docRow}>
                  {licenseFrontUri ? (
                    <View style={styles.docThumb}>
                      <Image
                        source={{ uri: licenseFrontUri }}
                        style={styles.docImage}
                      />
                      <Text style={styles.docThumbLabel}>Front</Text>
                    </View>
                  ) : null}
                  {licenseBackUri ? (
                    <View style={styles.docThumb}>
                      <Image
                        source={{ uri: licenseBackUri }}
                        style={styles.docImage}
                      />
                      <Text style={styles.docThumbLabel}>Back</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {/* Selfie + Face Match */}
            {selfieUri ? (
              <View style={styles.docGroup}>
                <View style={styles.docLabelRow}>
                  <Ionicons name="person-circle" size={18} color="#2C3E5B" />
                  <Text style={styles.docLabel}>Facial Verification</Text>
                  {faceMatchPassed !== null && (
                    <View
                      style={[
                        styles.badge,
                        faceMatchPassed
                          ? styles.badgeSuccess
                          : styles.badgeWarning,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          faceMatchPassed
                            ? styles.badgeTextSuccess
                            : styles.badgeTextWarning,
                        ]}
                      >
                        {faceMatchPassed
                          ? `Match ${faceMatchConfidence?.toFixed(0)}%`
                          : "No match"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.selfieRow}>
                  <Image
                    source={{ uri: selfieUri }}
                    style={styles.selfieThumb}
                  />
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* ── Extracted Data (editable) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extracted Information</Text>
          <Text style={styles.sectionDesc}>
            Review and edit any fields that were not captured correctly.
          </Text>

          {isProcessing ? (
            <View style={styles.processingBox}>
              <ActivityIndicator size="small" color="#2C3E5B" />
              <Text style={styles.processingText}>Processing documents...</Text>
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full legal name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your full name"
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>National ID number</Text>
                <TextInput
                  value={nationalId}
                  onChangeText={setNationalId}
                  placeholder="Ghana Card number"
                  placeholderTextColor="#A0AAB4"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Your address"
                  placeholderTextColor="#A0AAB4"
                  style={styles.input}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.subsectionTitle}>License Details</Text>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfField]}>
                  <Text style={styles.label}>License number</Text>
                  <TextInput
                    value={licNumber}
                    onChangeText={setLicNumber}
                    placeholder="DVLA-123456"
                    placeholderTextColor="#A0AAB4"
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfField]}>
                  <Text style={styles.label}>License class</Text>
                  <TextInput
                    value={licClass}
                    onChangeText={setLicClass}
                    placeholder="e.g. B"
                    placeholderTextColor="#A0AAB4"
                    style={styles.input}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>License expiry</Text>
                <TextInput
                  value={licExpiry}
                  onChangeText={setLicExpiry}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#A0AAB4"
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
        </View>

        {/* ── No documents captured ── */}
        {!hasAnyDocuments && (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={40} color="#6E7E91" />
            <Text style={styles.emptyTitle}>No documents captured</Text>
            <Text style={styles.emptyDesc}>
              You skipped the document scanning steps. You can fill in your
              details manually and verify your documents later from your
              dashboard.
            </Text>
          </View>
        )}
      </ScrollView>
    </DriverStepShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Sections */
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: "#6E7E91",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 12,
  },

  /* Document thumbnails */
  docGroup: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  docLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeSuccess: { backgroundColor: "rgba(46, 204, 113, 0.12)" },
  badgeWarning: { backgroundColor: "rgba(255, 193, 7, 0.12)" },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextSuccess: { color: "#27AE60" },
  badgeTextWarning: { color: "#E67E22" },
  docRow: {
    flexDirection: "row",
    gap: 10,
  },
  docThumb: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F5F6F8",
  },
  docImage: {
    width: "100%",
    aspectRatio: 1.586,
    resizeMode: "cover",
  },
  docThumbLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6E7E91",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 4,
  },
  selfieRow: {
    alignItems: "flex-start",
  },
  selfieThumb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: "cover",
  },

  /* Form inputs */
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2C3E5B",
    marginBottom: 6,
  },
  input: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2C3E5B",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8ECF0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: { flex: 1 },
  divider: {
    height: 1,
    backgroundColor: "#E8ECF0",
    marginVertical: 16,
  },

  /* Processing */
  processingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  processingText: {
    fontSize: 14,
    color: "#6E7E91",
  },

  /* Empty state */
  emptyBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  emptyDesc: {
    fontSize: 13,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 18,
  },
});
