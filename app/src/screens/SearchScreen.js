import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@apollo/client";
import { SEARCH_USERS } from "../graphql/operations";
import Avatar from "../components/Avatar";
import Field from "../components/Field";
import { Empty, ErrorView, Loading } from "../components/StateViews";
import { colors } from "../theme";

export default function SearchScreen({ navigation }) {
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");

  // debounce typing so we don't query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setKeyword(input.trim()), 350);
    return () => clearTimeout(t);
  }, [input]);

  const { data, loading, error, refetch } = useQuery(SEARCH_USERS, {
    variables: { keyword },
    skip: !keyword,
  });

  let body = <Empty title="Search accounts" sub="Find people by name or username." />;
  if (keyword) {
    if (loading) body = <Loading />;
    else if (error) body = <ErrorView message={error.message} onRetry={() => refetch()} />;
    else if (!data?.searchUsers?.length) body = <Empty title="No results" sub={`Nothing found for "${keyword}"`} />;
    else {
      body = (
        <FlatList
          data={data.searchUsers}
          keyExtractor={(u) => u._id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate("UserProfile", { userId: item._id })}>
              <Avatar name={item.name} id={item._id} size={48} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </Pressable>
          )}
        />
      );
    }
  }

  return (
    <View style={styles.flex}>
      <View style={{ padding: 12 }}>
        <Field placeholder="Search" value={input} onChangeText={setInput} style={{ marginBottom: 0 }} />
      </View>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  username: { color: colors.text, fontWeight: "800", fontSize: 16 },
  name: { color: colors.muted, marginTop: 2 },
});
