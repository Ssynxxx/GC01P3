import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "./Avatar";
import { colors, tintFor } from "../theme";

// One full-screen "video" in the For You feed
export default function PostCard({ post, height, liked, onLike, onComment, onAuthor }) {
  const author = post.author || { name: "Unknown", username: "unknown" };

  return (
    <View style={[styles.card, { height, backgroundColor: tintFor(post._id) }]}>
      {post.imgUrl ? <Image source={{ uri: post.imgUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      <View style={styles.scrim} pointerEvents="none" />

      {/* caption first, so the buttons are drawn on top of it */}
      <View style={styles.caption} pointerEvents="box-none">
        <Pressable onPress={onAuthor}>
          <Text style={styles.author}>@{author.username}</Text>
        </Pressable>
        <Text style={styles.content} numberOfLines={4}>{post.content}</Text>
        {post.tags?.length ? (
          <Text style={styles.tags} numberOfLines={1}>{post.tags.map((t) => `#${t}`).join(" ")}</Text>
        ) : null}
      </View>

      <View style={styles.rail}>
        <Pressable onPress={onAuthor} hitSlop={8}>
          <Avatar name={author.name} id={author._id} size={48} />
        </Pressable>

        <Pressable onPress={onLike} style={styles.action} hitSlop={8}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={36} color={liked ? colors.pink : colors.text} />
          <Text style={styles.count}>{post.likesCount}</Text>
        </Pressable>

        <Pressable onPress={onComment} style={styles.action} hitSlop={8}>
          <Ionicons name="chatbubble-ellipses" size={34} color={colors.text} />
          <Text style={styles.count}>{post.commentsCount}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", justifyContent: "flex-end" },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "42%", backgroundColor: "rgba(0,0,0,0.45)" },
  rail: { position: "absolute", right: 12, bottom: 28, alignItems: "center", gap: 22, zIndex: 2 },
  action: { alignItems: "center" },
  count: { color: colors.text, fontSize: 13, fontWeight: "700", marginTop: 2 },
  caption: { paddingLeft: 14, paddingRight: 84, paddingBottom: 30 },
  author: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 6 },
  content: { color: colors.text, fontSize: 15, lineHeight: 20 },
  tags: { color: colors.cyan, fontSize: 14, fontWeight: "700", marginTop: 6 },
});