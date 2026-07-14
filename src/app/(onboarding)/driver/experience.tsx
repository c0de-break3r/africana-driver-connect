import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";

import { DriverStepShell } from "@/components/driver-step-shell";
import { OnboardingOptionRow } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const OPTIONS = [
  { value: "<1", label: "Less than 1 year" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-7", label: "3–7 years" },
  { value: "7+", label: "More than 7 years" },
];

export default function DrivingExperienceScreen() {
  const { yearsExperience, setExperience, setStep } =
    useDriverOnboardingStore();

  const handleSelect = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExperience(value);
  };

  const handleContinue = () => {
    if (!yearsExperience) return;
    setStep(1);
    router.push("/(onboarding)/driver/employment" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={0}
      title="How many years of driving experience do you have?"
      description="This helps us match you with opportunities that fit your experience."
      buttonDisabled={!yearsExperience}
      onContinue={handleContinue}
    >
      {OPTIONS.map((option, index) => (
        <OnboardingOptionRow
          key={option.value}
          title={option.label}
          selected={yearsExperience === option.value}
          isLast={index === OPTIONS.length - 1}
          onPress={() => handleSelect(option.value)}
        />
      ))}
    </DriverStepShell>
  );
}
