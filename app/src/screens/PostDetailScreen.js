import { useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@apollo/client";
import { COMMENT_POST, GET_POST_BY_ID, LIKE_POST } from "../graphql/operations";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import Field from "../components/Field";
import { ErrorView, Loading } from "../components/StateViews";
import { colors, tintFor, timeAgo } from "../theme";

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const { data, loading, error: queryError, refetch } = useQuery(GET_POST_BY_ID, {
    variables: { id: postId },
    fetchPolicy: "cache-and-network",
  });
  const [commentPost, { loading: sending }] = useMutation(COMMENT_POST);
  const [likePost] = useMutation(LIKE_POST);

  const post = data?.getPostById;
  if (!post && loading) return <Loading />;
  if (!post) return <ErrorView message={queryError?.message || "Post not found"} onRetry={() => refetch()} />;

  const liked = post.likes?.some((l) => l.username === user.username);

  const send = async () => {
    if (!text.trim()) return;
    setError("");
    try {
      await commentPost({ variables: { postId, content: text } });
      setText("");
    } catch (err) {
      setError(err.message);
    }
  };

  const header = (
    <View style={styles.header}>
      <View style={[styles.cover, { backgroundColor: tintFor(post._id) }]}>
        {post.imgUrl ? <Image source={{ uri: post.imgUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      </View>

      <Pressable style={styles.authorRow} onPress={() => post.author && navigation.navigate("UserProfile", { userId: post.author._id })}>
        <Avatar name={post.author?.name} id={post.author?._id} size={40} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.name}>{post.author?.name}</Text>
          <Text style={styles.muted}>@{post.author?.username} · {timeAgo(post.createdAt)}</Text>
        </View>
        <Pressable onPress={() => likePost({ variables: { postId } }).catch(() => {})} style={styles.likeBtn} hitSlop={8}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={28} color={liked ? colors.pink : colors.text} />
          <Text style={styles.likeCount}>{post.likesCount}</Text>
        </Pressable>
      </Pressable>

      <Text style={styles.content}>{post.content}</Text>
      {post.tags?.length ? <Text style={styles.tags}>{post.tags.map((t) => `#${t}`).join(" ")}</Text> : null}
      <Text style={styles.section}>{post.commentsCount} comments</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <FlatList
        data={post.comments}
        keyExtractor={(_, i) => String(i)}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={[styles.muted, { padding: 16 }]}>No comments yet. Say something nice.</Text>}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Avatar name={item.username} size={32} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.muted}>@{item.username} · {timeAgo(item.createdAt)}</Text>
              <Text style={styles.commentText}>{item.content}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.composer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.row}>
          <Field placeholder="Add comment…" value={text} onChangeText={setText} style={styles.input} autoCapitalize="sentences" />
          <Pressable onPress={send} disabled={sending || !text.trim()} style={[styles.send, (sending || !text.trim()) && { opacity: 0.4 }]}>
            <Ionicons name="arrow-up" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 16 },
  cover: { height: 260, borderRadius: 10, overflow: "hidden", marginBottom: 14 },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  name: { color: colors.text, fontWeight: "800", fontSize: 16 },
  muted: { color: colors.muted, fontSize: 13 },
  likeBtn: { alignItems: "center" },
  likeCount: { color: colors.text, fontWeight: "700", fontSize: 12 },
  content: { color: colors.text, fontSize: 15, lineHeight: 21 },
  tags: { color: colors.cyan, fontWeight: "700", marginTop: 6 },
  section: { color: colors.text, fontWeight: "800", marginTop: 18, fontSize: 15 },
  comment: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10 },
  commentText: { color: colors.text, fontSize: 15, marginTop: 2 },
  composer: { padding: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.bg },
  row: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, marginBottom: 0, marginRight: 8 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.pink, alignItems: "center", justifyContent: "center" },
  error: { color: colors.danger, marginBottom: 6, marginLeft: 4 },
});
