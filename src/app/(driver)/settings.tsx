import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Settings screen — placeholder for driver app preferences.
 */
export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Pressable
          style={styles.backBtn}
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(driver)" as Href)
          }
          hitSlop={12}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <View style={styles.center}>
          <Ionicons
            name="settings-outline"
            size={56}
            color="#6E7E91"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.body}>
            Notification preferences, privacy settings, and account management
            will live here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8F3" },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 28, fontWeight: "300", color: "#2C3E5B" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#2C3E5B", marginBottom: 8 },
  body: {
    fontSize: 15,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
