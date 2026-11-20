import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import { FOLLOW_USER, GET_USER_BY_ID } from "../graphql/operations";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import PrimaryButton from "../components/PrimaryButton";
import { Empty, ErrorView, Loading } from "../components/StateViews";
import { colors } from "../theme";

// Used for both the "Profile" tab (own profile) and "UserProfile" (someone else)
export default function ProfileScreen({ route, navigation }) {
  const { user: me, signOut } = useAuth();
  const userId = route.params?.userId || me._id;
  const isMe = userId === me._id;
  const [tab, setTab] = useState("followers");
  const [followError, setFollowError] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    fetchPolicy: "cache-and-network",
  });
  const [followUser, { loading: following }] = useMutation(FOLLOW_USER, {
    refetchQueries: ["GetUserById"],
    awaitRefetchQueries: true,
  });

  const profile = data?.getUserById;
  if (!profile && loading) return <Loading />;
  if (!profile) return <ErrorView message={error?.message || "User not found"} onRetry={() => refetch()} />;

  const alreadyFollowing = profile.followers.some((f) => f._id === me._id);
  const list = tab === "followers" ? profile.followers : profile.followings;

  const onFollow = async () => {
    setFollowError("");
    try {
      await followUser({ variables: { followingId: userId } });
    } catch (err) {
      setFollowError(err.message);
    }
  };

  const header = (
    <View style={styles.header}>
      <Avatar name={profile.name} id={profile._id} size={88} />
      <Text style={styles.username}>@{profile.username}</Text>
      <Text style={styles.name}>{profile.name}</Text>

      <View style={styles.stats}>
        <Pressable style={styles.stat} onPress={() => setTab("followings")}>
          <Text style={styles.statNum}>{profile.followingsCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </Pressable>
        <Pressable style={styles.stat} onPress={() => setTab("followers")}>
          <Text style={styles.statNum}>{profile.followersCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </Pressable>
      </View>

      {isMe ? (
        <PrimaryButton title="Log out" variant="outline" onPress={signOut} style={styles.cta} />
      ) : (
        <PrimaryButton
          title={alreadyFollowing ? "Following" : "Follow"}
          variant={alreadyFollowing ? "outline" : "solid"}
          disabled={alreadyFollowing}
          loading={following}
          onPress={onFollow}
          style={styles.cta}
        />
      )}
      {followError ? <Text style={styles.error}>{followError}</Text> : null}

      <View style={styles.tabs}>
        {["followers", "followings"].map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && { color: colors.text }]}>
              {t === "followers" ? "Followers" : "Following"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.flex}
      data={list}
      keyExtractor={(u) => u._id}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <Empty title={tab === "followers" ? "No followers yet" : "Not following anyone yet"} />
      }
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => navigation.push("UserProfile", { userId: item._id })}>
          <Avatar name={item.name} id={item._id} size={42} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.rowUser}>@{item.username}</Text>
            <Text style={styles.rowName}>{item.name}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: "center", paddingTop: 24 },
  username: { color: colors.text, fontSize: 19, fontWeight: "800", marginTop: 12 },
  name: { color: colors.muted, marginTop: 2 },
  stats: { flexDirection: "row", marginTop: 20 },
  stat: { alignItems: "center", paddingHorizontal: 28 },
  statNum: { color: colors.text, fontSize: 20, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 13, marginTop: 2 },
  cta: { marginTop: 18, minWidth: 180 },
  error: { color: colors.danger, marginTop: 10 },
  tabs: { flexDirection: "row", alignSelf: "stretch", marginTop: 22, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: colors.text },
  tabText: { color: colors.muted, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  rowUser: { color: colors.text, fontWeight: "800", fontSize: 15 },
  rowName: { color: colors.muted, marginTop: 1 },
});
