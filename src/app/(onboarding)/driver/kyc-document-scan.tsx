import { useEffect } from "react";
import { router } from "expo-router";
import { useKycFlowStore } from "@/store/useKycFlowStore";

export default function KycDocumentScanScreen() {
  const {
    documentFrontUri,
    documentBackUri,
    currentStep,
  } = useKycFlowStore();

  useEffect(() => {
    if (documentFrontUri && documentBackUri) {
      router.replace("/(onboarding)/driver/kyc-liveness");
    } else if (documentFrontUri) {
      router.replace("/(onboarding)/driver/kyc-back-id");
    } else {
      router.replace("/(onboarding)/driver/kyc-choose-id");
    }
  }, [documentFrontUri, documentBackUri]);

  return null;
}