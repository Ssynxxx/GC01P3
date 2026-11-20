import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { useMutation } from "@apollo/client";
import { ADD_POST, GET_POSTS } from "../graphql/operations";
import Field from "../components/Field";
import PrimaryButton from "../components/PrimaryButton";
import { colors } from "../theme";

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [error, setError] = useState("");
  const [addPost, { loading }] = useMutation(ADD_POST, {
    refetchQueries: [{ query: GET_POSTS }],
    awaitRefetchQueries: true,
  });

  const onSubmit = async () => {
    setError("");
    try {
      await addPost({
        variables: {
          input: {
            content,
            imgUrl,
            tags: tags.split(/[\s,]+/).filter(Boolean),
          },
        },
      });
      setContent(""); setTags(""); setImgUrl("");
      navigation.navigate("Home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Caption</Text>
        <Field placeholder="Describe your video…" value={content} onChangeText={setContent} multiline autoCapitalize="sentences" />

        <Text style={styles.label}>Hashtags</Text>
        <Field placeholder="dance, fyp, jakarta" value={tags} onChangeText={setTags} />

        <Text style={styles.label}>Cover image URL</Text>
        <Field placeholder="https://…" value={imgUrl} onChangeText={setImgUrl} keyboardType="url" />
        {imgUrl.trim() ? <Image source={{ uri: imgUrl.trim() }} style={styles.preview} resizeMode="cover" /> : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="Post" onPress={onSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16 },
  label: { color: colors.muted, fontSize: 13, fontWeight: "700", marginBottom: 6 },
  preview: { width: 120, height: 213, borderRadius: 8, marginBottom: 14, backgroundColor: colors.surfaceHigh },
  error: { color: colors.danger, marginBottom: 12 },
});
