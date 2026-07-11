import { StyleSheet, View } from "react-native";

type PageDotsProps = {
  /** Total number of pages/steps */
  total: number;
  /** Current page index (0-based) */
  current: number;
};

/**
 * Pagination dot indicator — matches onboarding reference images:
 * small circles centered at the top of the screen.
 * Active dot is dark (foreground), inactive dots are light gray.
 *
 * Reference: image-reference/onboarding/onboarding03–07.jpg
 */
export function PageDots({ total, current }: PageDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#2C3E5B",
  },
  dotInactive: {
    backgroundColor: "#D1D5DB",
  },
});
