import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";

import { OnboardingOptionRow } from "@/components/ui";
import { DriverStepShell } from "@/components/driver-step-shell";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const OPTIONS = [
  { value: "short_trips", label: "Daily short trips" },
  { value: "long_distance", label: "Long-distance trips" },
  { value: "corporate", label: "Corporate/executive driving" },
  { value: "event", label: "Event and occasion driving" },
];

export default function PreferredJobTypeScreen() {
  const { preferredJobType, setPreferredJobType, setStep } =
    useDriverOnboardingStore();

  const handleSelect = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreferredJobType(value);
  };

  const handleContinue = () => {
    if (!preferredJobType) return;
    setStep(6);
    router.push("/(onboarding)/driver/location" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={5}
      title="What kind of driving do you want most?"
      description="We'll prioritize jobs that match your preference."
      buttonDisabled={!preferredJobType}
      onContinue={handleContinue}
    >
      {OPTIONS.map((option, index) => (
        <OnboardingOptionRow
          key={option.value}
          title={option.label}
          selected={preferredJobType === option.value}
          isLast={index === OPTIONS.length - 1}
          onPress={() => handleSelect(option.value)}
        />
      ))}
    </DriverStepShell>
  );
}
