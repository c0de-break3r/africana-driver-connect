import { useState } from "react";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui";
import { images } from "@/constants/images";
import { useKycFlowStore } from "@/store/useKycFlowStore";
import { useRoleStore } from "@/store/useRoleStore";

type Service = "transport" | "delivery" | "rental";
type VehicleType = "car" | "motor";

const SERVICES: Array<{ key: Service; title: string; description: string }> = [
  { key: "transport", title: "Transport", description: "Ride-hailing and passenger transport" },
  { key: "delivery", title: "Delivery", description: "Parcel and goods delivery" },
  { key: "rental", title: "Rental", description: "Vehicle rental services" },
];

const VEHICLE_TYPES: Array<{ key: VehicleType; label: string; icon: string }> = [
  { key: "car", label: "Car", icon: "🚗" },
  { key: "motor", label: "Motor/Okada", icon: "🏍️" },
];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_HEIGHT * 0.54;

export default function KycIntroScreen() {
  const { setStatus, setStep } = useKycFlowStore();
  const setRole = useRoleStore((s) => s.setRole);
  
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);

  const toggleService = (service: Service) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      }
      return [...prev, service];
    });
  };

  const handleNext = () => {
    if (selectedServices.length === 0 || !selectedVehicle) return;
    
    setRole("driver");
    setStatus("capturing");
    setStep(2);
    router.push("/(auth)/sign-in" as Href);
  };

  const handleBack = () => {
    // Try to go back, but if no route (e.g., deep link), go to welcome
    try {
      router.back();
    } catch {
      router.replace("/(onboarding)/welcome" as Href);
    }
  };

  const canProceed = selectedServices.length > 0 && selectedVehicle !== null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      </View>

      {/* ── Hero image ── */}
      <View style={styles.imageContainer}>
        <Image source={images.heroIllustrator} style={styles.heroImage} contentFit="cover" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose Services</Text>
        <Text style={styles.subtitle}>
          Choose the services you want to provide. You can change them anytime in your profile.
        </Text>

        <View style={styles.section}>
          {SERVICES.map((service) => {
            const isSelected = selectedServices.includes(service.key);
            return (
              <Pressable
                key={service.key}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleService(service.key)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{service.title}</Text>
                    <Text style={styles.cardDescription}>{service.description}</Text>
                  </View>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Select Vehicle Type</Text>
        <View style={styles.vehicleRow}>
          {VEHICLE_TYPES.map((vtype) => {
            const isSelected = selectedVehicle === vtype.key;
            return (
              <Pressable
                key={vtype.key}
                style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                onPress={() => setSelectedVehicle(vtype.key)}
              >
                <Text style={styles.vehicleIcon}>{vtype.icon}</Text>
                <Text style={[styles.vehicleLabel, isSelected && styles.vehicleLabelSelected]}>
                  {vtype.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Next"
          onPress={handleNext}
          disabled={!canProceed}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 24,
    color: "#2C3E5B",
    fontWeight: "300",
  },
  imageContainer: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    height: HERO_HEIGHT,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  scroll: {
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.53,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAE1D9",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#FF7B54",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: "#6E7E91",
    lineHeight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#FF7B54",
    borderColor: "#FF7B54",
  },
  checkmark: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 12,
  },
  vehicleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE1D9",
  },
  vehicleCardSelected: {
    borderWidth: 2,
    borderColor: "#FF7B54",
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6E7E91",
  },
  vehicleLabelSelected: {
    color: "#2C3E5B",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});