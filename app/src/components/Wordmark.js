import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

// the cyan / pink split-shadow logotype
export default function Wordmark({ size = 32 }) {
  const base = { fontSize: size, fontWeight: "900", letterSpacing: -1 };
  return (
    <View style={{ height: size * 1.25, justifyContent: "center" }}>
      <Text style={[base, styles.layer, { color: colors.cyan, left: -size * 0.05 }]}>TikTok</Text>
      <Text style={[base, styles.layer, { color: colors.pink, left: size * 0.05, top: size * 0.04 }]}>TikTok</Text>
      <Text style={[base, { color: colors.text }]}>TikTok</Text>
    </View>
  );
}

const styles = StyleSheet.create({ layer: { position: "absolute" } });
