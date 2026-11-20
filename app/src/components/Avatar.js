import { Text, View } from "react-native";
import { colors, tintFor } from "../theme";

export default function Avatar({ name = "?", id, size = 44 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tintFor(id || name),
        borderWidth: 1.5,
        borderColor: colors.text,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.text, fontWeight: "800", fontSize: size * 0.42 }}>
        {(name[0] || "?").toUpperCase()}
      </Text>
    </View>
  );
}
