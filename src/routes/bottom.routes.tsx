// src/routes/bottom.routes.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Dashboard from "../pages/dashboard";
import Agenda from "../pages/agenda";
import Config from "../pages/config";
import { View } from "react-native";

const Tab = createBottomTabNavigator();

export default function BottomRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,

        // cores e aparência
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#9AA0A6",
        tabBarStyle: {
          height: 90,
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 0,
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 10,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
          marginBottom: 2,
        },

        // Ícones sem alternar outline / fill — só mudam de cor
        tabBarIcon: ({ color, size }) => {
          const iconSize = 26;
          let name: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Dashboard") name = "home";
          if (route.name === "Agenda") name = "calendar";
          if (route.name === "Perfil") name = "person";
          if (route.name === "Config") name = "settings";

          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={name} size={iconSize} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ title: "Início" }}
      />
      <Tab.Screen
        name="Agenda"
        component={Agenda}
        options={{ title: "Calendário" }}
      />

      <Tab.Screen
        name="Config"
        component={Config}
        options={{ title: "Config." }}
      />
    </Tab.Navigator>
  );
}
