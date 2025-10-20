import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "../../hooks/useThemeColors";
import * as Speech from "expo-speech";
import { useSettings, ts } from "../../context/settings";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../routes/index.routes";
import AppHeader from "../../components/app-header";

import { theme } from "../../global/themes";
import { supabase } from "../../../lib/supabase";

type Agendamento = {
  id: string;
  usuario_id: number | string | null;
  titulo: string;
  horario: string;
  local: string | null;
  minutos_antecedencia: number;
  categoria: "Pessoal" | "Trabalho" | "Saúde" | "Educação" | "Outro";
};

export default function Dashboard() {
  const { ttsEnabled, fontScale, highContrast } = useSettings();
  const colors = highContrast
    ? {
        ...theme.colors,
        primary: "#0000FF",
        text: "#000",
        white: "#FFF",
        bg: "#FFF",
        muted: "#111",
      }
    : theme.colors;
  const nav = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [itens, setItens] = useState<Agendamento[]>([]);

  // TODO: integrar com o usuário logado quando estiver pronto
  const currentUserId = null as unknown as number | null;

  const hojeStr = useMemo(
    () =>
      format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      }),
    []
  );

  const fetchHoje = useCallback(async () => {
    try {
      setLoading(true);

      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date();
      fimDoDia.setHours(23, 59, 59, 999);

      let query = supabase
        .from("agendamentos")
        .select(
          "id, usuario_id, titulo, horario, local, minutos_antecedencia, categoria"
        )
        .gte("horario", inicioDoDia.toISOString())
        .lte("horario", fimDoDia.toISOString())
        .order("horario", { ascending: true });

      if (currentUserId != null) query = query.eq("usuario_id", currentUserId);

      const { data, error } = await query;
      if (error) throw error;

      setItens((data as Agendamento[]) ?? []);
    } catch (e: any) {
      Alert.alert("Erro ao carregar eventos", e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Ao focar na aba, recarrega
  useFocusEffect(
    useCallback(() => {
      fetchHoje();
    }, [fetchHoje])
  );

  // Realtime: reage a inserts/updates/deletes
  useEffect(() => {
    const channel = supabase
      .channel("agendamentos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agendamentos" },
        (payload) => {
          // Se quiser filtrar por usuário:
          // if (currentUserId != null && payload.new?.usuario_id !== currentUserId) return;
          fetchHoje();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHoje]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchHoje();
    setRefreshing(false);
  }

  function lerEventos() {
    if (!itens.length) {
      Speech.speak("Você não possui eventos para hoje.", { language: "pt-BR" });
      return;
    }
    const texto = itens
      .map((ev) => {
        const hora = format(new Date(ev.horario), "HH:mm");
        const cat = ev.categoria ?? "Outro";
        const loc = ev.local ? `, no local ${ev.local}` : "";
        return `${hora} — ${ev.titulo} — categoria ${cat}${loc}`;
      })
      .join(". ");
    Speech.speak(`Seus eventos de hoje são: ${texto}.`, { language: "pt-BR" });
  }

  function corCategoria(categoria?: Agendamento["categoria"]) {
    return theme.colors.cat[categoria ?? "Outro"];
  }

  function CardEvento({ item }: { item: Agendamento }) {
    const hora = format(new Date(item.horario), "HH:mm");
    const dia = format(new Date(item.horario), "dd/MM");

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          nav.navigate("EventoDetalhe" as never, { id: item.id } as never)
        }
      >
        <View
          style={[
            styles.card,
            { backgroundColor: corCategoria(item.categoria) },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.badge}>{item.categoria}</Text>
            <Text style={styles.hora}>{hora}</Text>
          </View>

          <Text style={styles.titulo}>{item.titulo}</Text>

          <View style={styles.metaRow}>
            <MaterialIcons name="place" size={18} color="#fff" />
            <Text style={styles.metaText}>{item.local ?? "Sem local"}</Text>
          </View>

          <View style={styles.metaRow}>
            <MaterialIcons name="alarm" size={18} color="#fff" />
            <Text style={styles.metaText}>
              Avisar {item.minutos_antecedencia} min antes
            </Text>
          </View>

          {!isSameDay(new Date(item.horario), new Date()) && (
            <Text style={styles.dataForaHoje}>{dia}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <LinearGradient
        colors={[theme.colors.gradStart, theme.colors.gradEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <AppHeader title="EducAgenda" subtitle="Agendamentos de hoje" />
      </LinearGradient>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Hoje</Text>
        <Text style={styles.sectionSub}>{hojeStr}</Text>

        {loading ? (
          <View style={{ paddingTop: 32 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={itens}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <CardEvento item={item} />}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum agendamento para hoje.
              </Text>
            }
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
      {ttsEnabled && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 24,
            bottom: 160, // fica acima do FAB
            paddingHorizontal: 16,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 25,
          }}
          onPress={() => {
            if (!eventosHoje.length) {
              Speech.speak("Não há eventos para hoje.", { language: "pt-BR" });
              return;
            }
            const texto = eventosHoje
              .map((e) => {
                const hora = format(new Date(e.horario), "HH:mm");
                const loc = e.local ? `, em ${e.local}` : "";
                return `${hora}: ${e.titulo}${loc}.`;
              })
              .join(" ");
            Speech.speak(texto, {
              language: "pt-BR",
              rate: Platform.OS === "ios" ? 0.5 : 1.0,
            });
          }}
          accessibilityLabel="Ler eventos do dia"
          accessibilityHint="Lê em voz alta os eventos de hoje"
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Ler eventos</Text>
        </TouchableOpacity>
      )}
      {/* FAB “+” */}
      <TouchableOpacity
        style={styles.fabUnified}
        onPress={() => nav.navigate("CriarEvento" as never)}
        accessibilityLabel="Botão criar novo evento"
        accessibilityHint="Abre a tela para adicionar um novo agendamento"
        activeOpacity={0.9}
      >
        <Ionicons
          name="add"
          size={35}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.fabText}>Novo Evento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },

  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerTitleBox: {
    width: "100%",
  },
  appTitle: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "left",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },

  quickGrid: { marginTop: 16, flexDirection: "row", gap: 12 },
  quickItem: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 12,
    gap: 6,
  },
  quickTitle: { fontWeight: "700", color: theme.colors.text },
  quickSub: { fontSize: 12, color: theme.colors.muted },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  sectionSub: { color: theme.colors.muted, marginBottom: 12 },

  card: { borderRadius: theme.radius.lg, padding: 14, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    color: "#fff",
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  hora: { color: "#fff", fontWeight: "700" },
  titulo: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  metaText: { color: "#fff" },
  dataForaHoje: { color: "#fff", opacity: 0.85, marginTop: 8, fontSize: 12 },

  emptyText: { color: theme.colors.muted, marginTop: 12 },

  fabContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    right: 24,
    bottom: 90, // ajustado para ficar acima da barra
    zIndex: 20,
  },

  fabUnified: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    right: 10,
    bottom: 100, // mantém acima da barra
    paddingHorizontal: 22,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 20,
  },

  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
