import { StyleSheet, View } from "react-native";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/StateViews";
import { colors } from "../theme";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import CreatePostScreen from "../screens/CreatePostScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PostDetailScreen from "../screens/PostDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, border: colors.border, primary: colors.text, text: colors.text },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: "800" },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

// the centre "+" button, with the cyan / pink split edges
function CreateIcon() {
  return (
    <View style={styles.createWrap}>
      <View style={[styles.edge, { backgroundColor: colors.cyan, left: 0 }]} />
      <View style={[styles.edge, { backgroundColor: colors.pink, right: 0 }]} />
      <View style={styles.createBody}>
        <Ionicons name="add" size={22} color="#000" />
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...headerOptions,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: "Discover", tabBarIcon: ({ color }) => <Ionicons name="search" size={26} color={color} /> }}
      />
      <Tab.Screen
        name="Create"
        component={CreatePostScreen}
        options={{ title: "New post", tabBarIcon: () => <CreateIcon /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Me", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={26} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { loading, token } = useAuth();
  if (loading) return <Loading />;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={headerOptions}>
        {token ? (
          <>
            <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: "Comments", headerBackTitle: "Back" }} />
            <Stack.Screen name="UserProfile" component={ProfileScreen} options={{ title: "Profile", headerBackTitle: "Back" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  createWrap: { width: 46, height: 30, justifyContent: "center" },
  edge: { position: "absolute", width: 36, height: 30, borderRadius: 8 },
  createBody: { marginHorizontal: 5, height: 30, borderRadius: 8, backgroundColor: colors.text, alignItems: "center", justifyContent: "center" },
});
