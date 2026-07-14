import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";

import { DriverStepShell } from "@/components/driver-step-shell";
import { OnboardingOptionRow } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const OPTIONS = [
  { value: "first_gig", label: "Land my first verified gig" },
  { value: "earn_more", label: "Earn more consistently" },
  { value: "reputation", label: "Build a strong reputation" },
  { value: "long_term", label: "Find long-term work" },
];

export default function DriverGoalsScreen() {
  const { driverGoal, setDriverGoal, setStep } = useDriverOnboardingStore();

  const handleSelect = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDriverGoal(value);
  };

  const handleContinue = () => {
    if (!driverGoal) return;
    setStep(3);
    router.push("/(onboarding)/driver/license" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={2}
      title="What's your biggest goal right now?"
      description="We'll make sure your dashboard is built around this."
      buttonDisabled={!driverGoal}
      onContinue={handleContinue}
    >
      {OPTIONS.map((option, index) => (
        <OnboardingOptionRow
          key={option.value}
          title={option.label}
          selected={driverGoal === option.value}
          isLast={index === OPTIONS.length - 1}
          onPress={() => handleSelect(option.value)}
        />
      ))}
    </DriverStepShell>
  );
}
