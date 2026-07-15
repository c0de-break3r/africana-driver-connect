import { Link, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export type AuthFooterProps =
  | {
      /** Show "Don't have an account? Sign up" → links to sign-up */
      variant: "sign-up-link";
      /** Optional `from` param to pass through */
      from?: string;
    }
  | {
      /** Show "Already have an account? Log in" → links to sign-in */
      variant: "sign-in-link";
      from?: string;
    }
  | {
      /** Show "Remember your password? Sign in" → links to sign-in */
      variant: "forgot-password-link";
    };

/**
 * Auth screen footer — a centered text line with a navigation link.
 *
 * Three variants matching the existing screens:
 * - sign-up-link:  "Don't have an account? Sign up"
 * - sign-in-link:  "Already have an account? Log in"
 * - forgot-password-link: "Remember your password? Sign in"
 */
export function AuthFooter(props: AuthFooterProps) {
  if (props.variant === "sign-up-link") {
    const href: Href = props.from
      ? (`/(auth)/sign-up?from=${props.from}` as Href)
      : "/(auth)/sign-up";
    return (
      <View style={styles.footerWrap}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href={href}>
          <Text style={styles.footerLink}>Sign up</Text>
        </Link>
      </View>
    );
  }

  if (props.variant === "sign-in-link") {
    const href: Href = props.from
      ? (`/(auth)/sign-in?from=${props.from}` as Href)
      : "/(auth)/sign-in";
    return (
      <View style={styles.footerWrap}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href={href}>
          <Text style={styles.footerLink}>Log in</Text>
        </Link>
      </View>
    );
  }

  // forgot-password-link
  return (
    <View style={styles.footerWrap}>
      <Text style={styles.footerText}>Remember your password? </Text>
      <Link href="/(auth)/sign-in" asChild>
        <Text style={styles.footerLink}>Sign in</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#A0AAB4",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E5B",
  },
});
