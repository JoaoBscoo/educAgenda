import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import { supabase } from "../../../lib/supabase";
import { theme } from "../../global/themes";
import type { RootStackParamList } from "../../routes/index.routes";

type RouteP = RouteProp<RootStackParamList, "EventoDetalhe">;

type Agendamento = {
  id: string;
  titulo: string;
  horario: string;
  local: string | null;
  minutos_antecedencia: number;
  categoria: "Pessoal" | "Trabalho" | "Saúde" | "Educação" | "Outro";
};

export default function EventDetail() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteP>();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Agendamento | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("agendamentos")
        .select("id, titulo, horario, local, minutos_antecedencia, categoria")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      setItem(data as Agendamento);
    } catch (e: any) {
      Alert.alert("Erro", e.message ?? String(e));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar(); // recarrega ao voltar da edição
    }, [carregar])
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir() {
    Alert.alert(
      "Excluir evento",
      "Tem certeza? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("agendamentos")
                .delete()
                .eq("id", id);
              if (error) throw error;
              navigation.goBack();
            } catch (e: any) {
              Alert.alert("Erro ao excluir", e.message ?? String(e));
            }
          },
        },
      ]
    );
  }

  if (loading || !item) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator />
      </View>
    );
  }

  const dataStr = format(
    new Date(item.horario),
    "EEEE, d 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );
  const horaStr = format(new Date(item.horario), "HH:mm");

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          { borderLeftColor: theme.colors.cat[item.categoria] },
        ]}
      >
        <Text style={styles.title}>{item.titulo}</Text>

        <View style={styles.row}>
          <Ionicons name="calendar" size={20} color={theme.colors.text} />
          <Text style={styles.rowText}>{dataStr}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="time" size={20} color={theme.colors.text} />
          <Text style={styles.rowText}>{horaStr}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="place" size={20} color={theme.colors.text} />
          <Text style={styles.rowText}>{item.local ?? "Sem local"}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="alarm" size={20} color={theme.colors.text} />
          <Text style={styles.rowText}>
            Avisar {item.minutos_antecedencia} min antes
          </Text>
        </View>

        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.categoria}</Text>
        </View>
      </View>

      {/* Barra de ações fixa no rodapé */}
      <View style={[styles.actionsBar, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={() =>
            navigation.navigate("EditarEvento" as never, { id } as never)
          }
        >
          <Text style={[styles.btnText, { color: "#fff" }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDanger]}
          onPress={excluir}
        >
          <Text style={[styles.btnText, { color: "#fff" }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  rowText: { color: theme.colors.text, fontSize: 16 },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
  },
  tagText: { color: "#4F46E5", fontWeight: "700" },

  actionsBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: theme.colors.bg,
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: theme.colors.secundary },
  btnDanger: { backgroundColor: "#FF3B30" },
  btnText: { fontSize: 16, fontWeight: "700" },
});
