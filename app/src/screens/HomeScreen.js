import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GET_POSTS, LIKE_POST } from "../graphql/operations";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import Wordmark from "../components/Wordmark";
import { Empty, ErrorView, Loading } from "../components/StateViews";
import { colors } from "../theme";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_POSTS, { notifyOnNetworkStatusChange: true });
  const [likePost] = useMutation(LIKE_POST);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refetch(); } finally { setRefreshing(false); }
  }, [refetch]);

  const posts = data?.getPosts ?? [];

  let body;
  if (!data && loading) body = <Loading />;
  else if (!data && error) body = <ErrorView message={error.message} onRetry={() => refetch()} />;
  else if (!posts.length) body = <Empty title="No videos yet" sub="Be the first to post something." />;
  else if (height) {
    body = (
      <FlatList
        data={posts}
        keyExtractor={(p) => p._id}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cyan} />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            height={height}
            liked={item.likes?.some((l) => l.username === user.username)}
            onLike={() => likePost({ variables: { postId: item._id } }).catch(() => {})}
            onComment={() => navigation.navigate("PostDetail", { postId: item._id })}
            onAuthor={() => item.author && navigation.navigate("UserProfile", { userId: item.author._id })}
          />
        )}
      />
    );
  }

  return (
    <View style={styles.flex} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {body}
      <View pointerEvents="none" style={[styles.logo, { top: insets.top + 6 }]}>
        <Wordmark size={26} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  logo: { position: "absolute", left: 0, right: 0, alignItems: "center" },
});
