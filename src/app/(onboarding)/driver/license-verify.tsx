import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    NativeEventEmitter,
    NativeModules,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { PrimaryButton, ScreenContainer } from "@/components/ui";
import {
    isMetaMapAvailable,
    showMetaMapVerification,
    type MetaMapCanceledPayload,
    type MetaMapSuccessPayload,
} from "@/lib/metamap";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

/**
 * License document + selfie verification using MetaMap.
 *
 * MetaMap's prebuilt native flow captures the driver's license and performs
 * liveness/selfie checks. We listen for verificationSuccess / verificationCanceled
 * events and route the user forward or allow a retry.
 */
export default function LicenseVerifyScreen() {
  const { fullLegalName, setLicenseVerificationResult } =
    useDriverOnboardingStore();

  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error" | "unavailable"
  >(() => (isMetaMapAvailable() ? "idle" : "unavailable"));
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    isMetaMapAvailable()
      ? null
      : "MetaMap is not available in Expo Go. Use a development build to verify your identity.",
  );

  const startVerification = useCallback(() => {
    setStatus("verifying");
    setErrorMessage(null);
    setLicenseVerificationResult("in_progress");

    const started = showMetaMapVerification({
      fullLegalName: fullLegalName || "",
      source: "africana_driver_connect_onboarding",
    });

    if (!started) {
      setStatus("unavailable");
      setErrorMessage(
        "MetaMap is not available in Expo Go. Use a development build to verify your identity.",
      );
    }
  }, [fullLegalName, setLicenseVerificationResult]);

  const skipVerification = useCallback(() => {
    setLicenseVerificationResult("success", "dev-build-skipped");
    router.push("/(onboarding)/driver/vehicle" as Href);
  }, [setLicenseVerificationResult]);

  useEffect(() => {
    if (!isMetaMapAvailable()) {
      return;
    }

    const sdk = NativeModules.MetaMapRNSdk;
    if (!sdk) {
      return;
    }

    const emitter = new NativeEventEmitter(sdk);

    const successSub = emitter.addListener(
      "verificationSuccess",
      (data: MetaMapSuccessPayload) => {
        setLicenseVerificationResult(
          "success",
          data.identityId ?? data.verificationId ?? null,
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStatus("success");
        router.push("/(onboarding)/driver/vehicle" as Href);
      },
    );

    const canceledSub = emitter.addListener(
      "verificationCanceled",
      (data: MetaMapCanceledPayload) => {
        const message = data.reason ?? "Verification was canceled.";
        setLicenseVerificationResult("error", null, message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setStatus("error");
        setErrorMessage(message);
      },
    );

    return () => {
      successSub.remove();
      canceledSub.remove();
    };
  }, [setLicenseVerificationResult]);

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify your identity</Text>
          <Text style={styles.description}>
            MetaMap will scan your driver&apos;s license and capture a quick
            selfie to confirm your identity.
          </Text>
        </View>

        <View style={styles.body}>
          {(status === "idle" || status === "unavailable") && (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>
                {status === "unavailable"
                  ? "Verification not available"
                  : "Ready to verify"}
              </Text>
              <Text style={styles.statusText}>
                {status === "unavailable"
                  ? (errorMessage ??
                    "MetaMap requires a development build. Expo Go is not supported.")
                  : "You\u0027ll scan your driver\u0027s license and take a quick selfie."}
              </Text>
              {status === "idle" && (
                <PrimaryButton
                  title="Start Verification"
                  onPress={startVerification}
                  style={{ width: "100%" }}
                />
              )}
              {status === "unavailable" && (
                <PrimaryButton
                  title="Continue for testing"
                  onPress={skipVerification}
                  style={{ width: "100%" }}
                />
              )}
            </View>
          )}

          {status === "verifying" && (
            <View style={styles.statusCard}>
              <ActivityIndicator size="large" color="#2C3E5B" />
              <Text style={styles.statusTitle}>Verification in progress</Text>
              <Text style={styles.statusText}>
                Please follow the instructions in the MetaMap window.
              </Text>
            </View>
          )}

          {status === "error" && (
            <View style={styles.statusCard}>
              <Text style={styles.errorTitle}>Verification not completed</Text>
              <Text style={styles.errorText}>
                {errorMessage ?? "Something went wrong."}
              </Text>
              <PrimaryButton
                title="Try Again"
                onPress={startVerification}
                style={{ width: "100%" }}
              />
            </View>
          )}

          {status === "success" && (
            <View style={styles.statusCard}>
              <ActivityIndicator size="large" color="#2C3E5B" />
              <Text style={styles.statusTitle}>Verification submitted</Text>
              <Text style={styles.statusText}>Continuing...</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  body: {
    flex: 1,
    justifyContent: "center",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 14,
    borderWidth: 2,
    borderColor: "#E8ECF0",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E74C3C",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
});
