import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMutation } from "@apollo/client";
import { REGISTER } from "../graphql/operations";
import Wordmark from "../components/Wordmark";
import Field from "../components/Field";
import PrimaryButton from "../components/PrimaryButton";
import { colors } from "../theme";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [register, { loading }] = useMutation(REGISTER);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async () => {
    setError("");
    try {
      await register({ variables: { input: form } });
      Alert.alert("Welcome!", "Your account is ready, please log in.");
      navigation.navigate("Login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Wordmark size={40} />
          <Text style={styles.title}>Sign up</Text>
        </View>

        <Field placeholder="Name" value={form.name} onChangeText={set("name")} autoCapitalize="words" />
        <Field placeholder="Username" value={form.username} onChangeText={set("username")} />
        <Field placeholder="Email" value={form.email} onChangeText={set("email")} keyboardType="email-address" />
        <Field placeholder="Password (min. 5 characters)" value={form.password} onChangeText={set("password")} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton title="Sign up" onPress={onSubmit} loading={loading} />
        <Text style={styles.switch}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>Log in</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  brand: { alignItems: "center", marginBottom: 28 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 10 },
  error: { color: colors.danger, marginBottom: 12 },
  switch: { color: colors.muted, textAlign: "center", marginTop: 22 },
  link: { color: colors.pink, fontWeight: "700" },
});
