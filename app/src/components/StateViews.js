import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import PrimaryButton from "./PrimaryButton";

export const Loading = () => (
  <View style={styles.center}>
    <ActivityIndicator color={colors.cyan} size="large" />
  </View>
);

export const ErrorView = ({ message, onRetry }) => (
  <View style={styles.center}>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.sub}>{message}</Text>
    {onRetry && <PrimaryButton title="Try again" onPress={onRetry} style={{ marginTop: 16 }} />}
  </View>
);

export const Empty = ({ title, sub }) => (
  <View style={styles.center}>
    <Text style={styles.title}>{title}</Text>
    {sub ? <Text style={styles.sub}>{sub}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 17, fontWeight: "700", textAlign: "center" },
  sub: { color: colors.muted, marginTop: 6, textAlign: "center", fontSize: 14 },
});
