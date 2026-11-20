import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

export default function PrimaryButton({ title, onPress, loading, disabled, variant = "solid", style }) {
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.btn,
        variant === "outline" ? styles.outline : styles.solid,
        off && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.label, variant === "outline" && { color: colors.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 4, paddingVertical: 13, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", minHeight: 46 },
  solid: { backgroundColor: colors.pink },
  outline: { borderWidth: 1, borderColor: colors.border, backgroundColor: "transparent" },
  label: { color: colors.text, fontWeight: "700", fontSize: 15 },
});
