import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../graphql/operations";
import { useAuth } from "../context/AuthContext";
import Wordmark from "../components/Wordmark";
import Field from "../components/Field";
import PrimaryButton from "../components/PrimaryButton";
import { colors } from "../theme";

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { loading }] = useMutation(LOGIN);

  const onSubmit = async () => {
    setError("");
    try {
      const { data } = await login({ variables: { username, password } });
      await signIn(data.login.accessToken, data.login.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Wordmark size={48} />
          <Text style={styles.tagline}>Make your day</Text>
        </View>

        <Field placeholder="Username" value={username} onChangeText={setUsername} />
        <Field placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton title="Log in" onPress={onSubmit} loading={loading} />
        <Text style={styles.switch}>
          Don't have an account?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Register")}>Sign up</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  brand: { alignItems: "center", marginBottom: 36 },
  tagline: { color: colors.muted, marginTop: 8, fontSize: 15 },
  error: { color: colors.danger, marginBottom: 12 },
  switch: { color: colors.muted, textAlign: "center", marginTop: 22 },
  link: { color: colors.pink, fontWeight: "700" },
});
