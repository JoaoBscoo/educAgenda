import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../pages/login";
import BottomRoutes from "./bottom.routes";
import EventNew from "../pages/event-new/index";
import EventDetail from "../pages/event-detail/index";
import EventEdit from "../pages/event-edit";

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CriarEvento: undefined;
  EventoDetalhe: { id: string };
  EditarEvento: { id: string }; // ⬅️ NOVO
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={BottomRoutes}
        options={{ headerShown: false }}
      />
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
          headerBackTitle: "Voltar", // ⬅️ deixa claro o “Voltar”
          headerTintColor: "#111827", // ⬅️ cor do ícone/label do back
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
