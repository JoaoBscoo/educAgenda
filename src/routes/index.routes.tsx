// src/routes/index.routes.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../pages/login";
import Register from "../pages/register"; // 👈 novo
import ForgotPassword from "../pages/forgot-password"; // 👈 novo

import BottomRoutes from "./bottom.routes";
import EventNew from "../pages/event-new/index";
import EventDetail from "../pages/event-detail/index";
import EventEdit from "../pages/event-edit";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined; // 👈 novo
  ForgotPassword: undefined; // 👈 novo
  MainTabs: undefined;
  CriarEvento: undefined;
  EventoDetalhe: { id: string };
  EditarEvento: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
    <Stack.Navigator>
      {/* Autenticação */}
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ headerShown: false }}
      />

      {/* App logado */}
      <Stack.Screen
        name="MainTabs"
        component={BottomRoutes}
        options={{ headerShown: false }}
      />

      {/* Telas de eventos */}
      <Stack.Screen
        name="CriarEvento"
        component={EventNew}
        options={{ title: "Novo evento", presentation: "modal" }}
      />
      <Stack.Screen
        name="EventoDetalhe"
        component={EventDetail}
        options={{
          title: "Detalhes do evento",
          headerBackTitle: "Voltar",
          headerTintColor: "#111827",
        }}
      />
      <Stack.Screen
        name="EditarEvento"
        component={EventEdit}
        options={{ title: "Editar evento", presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
