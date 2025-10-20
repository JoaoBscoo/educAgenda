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
import { Calendar, LocaleConfig, DateObject } from "react-native-calendars";
import AppHeader from "../../components/app-header";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "../../hooks/useThemeColors";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { supabase } from "../../../lib/supabase";
import { theme } from "../../global/themes";

// ---------- Locale PT-BR para o Calendário ----------
LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";
// ----------------------------------------------------

type Agendamento = {
  id: string;
  usuario_id: number | string | null;
  titulo: string;
  horario: string;
  local: string | null;
  minutos_antecedencia: number;
  categoria: "Pessoal" | "Trabalho" | "Saúde" | "Educação" | "Outro";
};

type MapEventos = Record<string, Agendamento[]>; // yyyy-MM-dd -> eventos

export default function Agenda() {
  const nav = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data selecionada (yyyy-MM-dd)
  const hoje = format(new Date(), "yyyy-MM-dd");
  const [selected, setSelected] = useState<string>(hoje);

  // Referência do mês atual exibido
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Cache de eventos por dia do mês atual
  const [mapEventos, setMapEventos] = useState<MapEventos>({});

  // TODO: quando integrar login, filtrar por usuario_id
  const currentUserId = null as unknown as number | null;

  const tituloMes = useMemo(
    () => format(currentMonth, "LLLL 'de' yyyy", { locale: ptBR }),
    [currentMonth]
  );

  // --------- Carrega todos os eventos do mês (uma ida ao DB) ----------
  const carregarMes = useCallback(
    async (anchorDate: Date) => {
      try {
        setLoading(true);
        const ini = startOfMonth(anchorDate);
        const fim = endOfMonth(anchorDate);

        let query = supabase
          .from("agendamentos")
          .select(
            "id, usuario_id, titulo, horario, local, minutos_antecedencia, categoria"
          )
          .gte("horario", ini.toISOString())
          .lte("horario", fim.toISOString())
          .order("horario", { ascending: true });

        if (currentUserId != null)
          query = query.eq("usuario_id", currentUserId);

        const { data, error } = await query;
        if (error) throw error;

        // Agrupa por dia (yyyy-MM-dd)
        const map: MapEventos = {};
        (data as Agendamento[]).forEach((ev) => {
          const key = format(new Date(ev.horario), "yyyy-MM-dd");
          if (!map[key]) map[key] = [];
          map[key].push(ev);
        });

        setMapEventos(map);

        // Se o dia selecionado não pertence ao mês carregado, mude para o 1º com evento ou o 1º do mês
        const selMonth = new Date(selected);
        if (
          selMonth.getMonth() !== anchorDate.getMonth() ||
          selMonth.getFullYear() !== anchorDate.getFullYear()
        ) {
          const firstWithEvent = Object.keys(map).sort()[0];
          setSelected(firstWithEvent ?? format(ini, "yyyy-MM-dd"));
        }
      } catch (e: any) {
        Alert.alert("Erro", e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    },
    [currentUserId, selected]
  );

  // Recarrega ao focar a aba
  useFocusEffect(
    useCallback(() => {
      carregarMes(currentMonth);
    }, [carregarMes, currentMonth])
  );

  // Realtime: escuta mudanças e recarrega mês atual
  useEffect(() => {
    const channel = supabase
      .channel("agendamentos-calendario")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agendamentos" },
        () => carregarMes(currentMonth)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [carregarMes, currentMonth]);

  async function onRefresh() {
    setRefreshing(true);
    await carregarMes(currentMonth);
    setRefreshing(false);
  }

  // Eventos do dia selecionado
  const eventosDoDia = mapEventos[selected] ?? [];

  // Dias marcados no calendário
  const markedDates = useMemo(() => {
    const marks: any = {};
    // marca os dias que possuem eventos
    Object.keys(mapEventos).forEach((d) => {
      marks[d] = {
        marked: true,
        dotColor: theme.colors.secundary,
      };
    });
    // destaca o selecionado
    marks[selected] = {
      ...(marks[selected] || {}),
      selected: true,
      selectedColor: theme.colors.secundary,
      selectedTextColor: "#fff",
    };
    return marks;
  }, [mapEventos, selected]);

  // Render de card (igual ao Dashboard, com navegação para detalhes)
  function CardEvento({ item }: { item: Agendamento }) {
    const hora = format(new Date(item.horario), "HH:mm");
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
            { backgroundColor: theme.colors.cat[item.categoria] },
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
        <AppHeader title="EducAgenda" subtitle="Agendamentos do mês" />
      </LinearGradient>
      <View style={styles.content}>
        {/* Calendário mensal */}
        <Calendar
          current={format(currentMonth, "yyyy-MM-dd")}
          onDayPress={(day: DateObject) => setSelected(day.dateString)}
          onMonthChange={(m) => {
            const d = new Date(m.year, m.month - 1, 1);
            setCurrentMonth(d);
            carregarMes(d);
          }}
          markedDates={markedDates}
          firstDay={1} // semana começa na segunda
          theme={{
            textSectionTitleColor: "#9AA0A6",
            monthTextColor: theme.colors.text,
            arrowColor: theme.colors.secundary,
            todayTextColor: "theme.colors.secundary",
            todayBackgroundColor: "rgba(0,122,255,0.1)", // leve fundo azulado para o dia atual
            textDayFontWeight: "600",
            textMonthFontWeight: "700",
            textDayHeaderFontWeight: "700",
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 12,
            selectedDayBackgroundColor: theme.colors.secundary, // ⬅️ importante
            selectedDayTextColor: "#fff", // ⬅️ importante
          }}
          style={styles.calendar}
        />

        {/* Lista do dia selecionado */}
        <View style={styles.listHeader}>
          <Ionicons name="calendar" size={18} color={theme.colors.text} />
          <Text style={styles.listHeaderText}>
            {format(new Date(selected), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingTop: 24 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={eventosDoDia}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <CardEvento item={item} />}
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhum evento neste dia.</Text>
            }
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{ paddingBottom: 28 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },

  title: { fontSize: 22, fontWeight: "800", color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
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

  calendar: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    elevation: 2,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listHeaderText: { fontWeight: "700", color: theme.colors.text },

  // Cards
  card: {
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
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

  empty: { paddingHorizontal: 16, color: theme.colors.muted, marginTop: 6 },
});
