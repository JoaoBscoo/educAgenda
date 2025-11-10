import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useSettings } from "../../context/settings";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AppHeader from "../../components/app-header";
import AppText from "../../components/AppText";
import { useThemeColors } from "../../hooks/useThemeColors";
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
  const { ttsEnabled } = useSettings();
  const colors = useThemeColors();

  const nav = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [itens, setItens] = useState<Agendamento[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const hojeStr = useMemo(
    () => format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    []
  );

  const fetchHoje = useCallback(async () => {
    try {
      setLoading(true);

      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date();
      fimDoDia.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("agendamentos")
        .select(
          "id, usuario_id, titulo, horario, local, minutos_antecedencia, categoria"
        )
        .gte("horario", inicioDoDia.toISOString())
        .lte("horario", fimDoDia.toISOString())
        .order("horario", { ascending: true });

      if (error) throw error;
      setItens(data ?? []);
    } catch (e: any) {
      Alert.alert("Erro ao carregar eventos", e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHoje();
      return () => {
        Speech.stop();
        setIsSpeaking(false);
      };
    }, [fetchHoje])
  );

  useEffect(() => {
    const channel = supabase
      .channel("agendamentos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agendamentos" },
        () => fetchHoje()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHoje]);

  function falarEventosDoDia() {
    Speech.stop();

    if (!itens.length) {
      Speech.speak("Você não possui eventos para hoje.", { language: "pt-BR" });
      return;
    }

    const texto = itens
      .map((ev, i) => {
        const hora = format(new Date(ev.horario), "HH:mm");
        const loc = ev.local ? `, no local ${ev.local}` : "";
        return `Evento ${i + 1}: ${ev.titulo}, às ${hora}${loc}.`;
      })
      .join(" ");

    setIsSpeaking(true);
    Speech.speak(texto, {
      language: "pt-BR",
      rate: 1.0,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  }

  function pararFala() {
    Speech.stop();
    setIsSpeaking(false);
  }

  // ---------- PDF ----------
  function buildAgendaHtml(hojeStrLocal: string, eventos: Agendamento[]) {
    const rows = eventos
      .map((ev) => {
        const hora = format(new Date(ev.horario), "HH:mm");
        const local = ev.local ? ev.local : "—";
        return `
          <tr>
            <td>${hora}</td>
            <td>${ev.titulo}</td>
            <td>${ev.categoria}</td>
            <td>${local}</td>
            <td>${ev.minutos_antecedencia} min</td>
          </tr>`;
      })
      .join("");

    return `
    <html lang="pt-br">
      <head>
        <meta charset="utf-8" />
        <style>
          * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          h1 { margin: 0 0 4px 0; font-size: 22px; }
          h2 { margin: 0 0 16px 0; font-size: 14px; color:#555; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; text-align:left; }
          th { background:#f7f7f7; font-weight:700; }
          .footer { margin-top: 18px; font-size: 11px; color:#888; }
        </style>
      </head>
      <body>
        <h1>EducAgenda</h1>
        <h2>Agendamentos de hoje — ${hojeStrLocal}</h2>

        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Título</th>
              <th>Categoria</th>
              <th>Local</th>
              <th>Lembrete</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="5">Sem agendamentos para hoje.</td></tr>`
            }
          </tbody>
        </table>

        <div class="footer">
          Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </div>
      </body>
    </html>`;
  }

  async function exportarAgendaPDF() {
    try {
      const html = buildAgendaHtml(hojeStr, itens);
      const { uri } = await Print.printToFileAsync({ html });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: "Enviar PDF da agenda",
        });
        return;
      }

      // Fallback: enviar texto via WhatsApp (sem PDF)
      const resumo = itens.length
        ? itens
            .map((ev) => {
              const h = format(new Date(ev.horario), "HH:mm");
              const loc = ev.local ? ` — ${ev.local}` : "";
              return `• ${h} - ${ev.titulo}${loc}`;
            })
            .join("%0A")
        : "Sem agendamentos para hoje.";
      const msg = `Agenda de hoje (${hojeStr})%0A${resumo}`;
      const url = `whatsapp://send?text=${msg}`;
      Alert.alert(
        "Compartilhar",
        "Seu dispositivo não suporta compartilhar PDF. Vou enviar o texto."
      );
      Linking.openURL(url);
    } catch (e: any) {
      Alert.alert("Erro ao exportar", e?.message ?? String(e));
    }
  }
  // ---------- /PDF ----------

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
            { backgroundColor: theme.colors.cat[item.categoria] },
          ]}
        >
          <View style={styles.cardHeader}>
            <AppText size={12} weight="700" style={styles.badge}>
              {item.categoria}
            </AppText>
            <AppText size={14} weight="700" style={styles.hora}>
              {hora}
            </AppText>
          </View>

          <AppText size={16} weight="800" style={styles.titulo}>
            {item.titulo}
          </AppText>

          <View style={styles.metaRow}>
            <MaterialIcons name="place" size={18} color="#fff" />
            <AppText style={styles.metaText}>
              {item.local ?? "Sem local"}
            </AppText>
          </View>

          <View style={styles.metaRow}>
            <MaterialIcons name="alarm" size={18} color="#fff" />
            <AppText style={styles.metaText}>
              Avisar {item.minutos_antecedencia} min antes
            </AppText>
          </View>

          {!isSameDay(new Date(item.horario), new Date()) && (
            <AppText size={12} style={styles.dataForaHoje}>
              {dia}
            </AppText>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={[theme.colors.gradStart, theme.colors.gradEnd]}
        style={styles.header}
      >
        <AppHeader title="EducAgenda" subtitle="Agendamentos de hoje" />
      </LinearGradient>

      <View style={styles.content}>
        <AppText size={18} weight="700" style={styles.sectionTitle}>
          Hoje
        </AppText>
        <AppText size={14} style={styles.sectionSub}>
          {hojeStr}
        </AppText>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={itens}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <CardEvento item={item} />}
            contentContainerStyle={{ paddingBottom: 180 }}
            ListEmptyComponent={
              <AppText style={styles.emptyText}>
                Nenhum agendamento para hoje.
              </AppText>
            }
            refreshing={refreshing}
            onRefresh={fetchHoje}
          />
        )}
      </View>

      {/* TTS */}
      {ttsEnabled && (
        <TouchableOpacity
          style={[styles.fabTTS, { backgroundColor: colors.primary }]}
          onPress={() => (isSpeaking ? pararFala() : falarEventosDoDia())}
        >
          <AppText weight="700" style={{ color: "#fff" }}>
            {isSpeaking ? "Parar" : "Ler eventos"}
          </AppText>
        </TouchableOpacity>
      )}

      {/* Exportar PDF / WhatsApp */}
      <TouchableOpacity
        style={[styles.fabExport, { backgroundColor: "#25D366" }]}
        onPress={exportarAgendaPDF}
        activeOpacity={0.9}
        accessibilityLabel="Exportar PDF"
        accessibilityHint="Gera um PDF dos agendamentos e abre o WhatsApp para enviar"
      >
        <Ionicons name="share-outline" size={22} color="#fff" />
        <AppText weight="700" style={{ color: "#fff", marginLeft: 8 }}>
          Exportar
        </AppText>
      </TouchableOpacity>

      {/* FAB Novo Evento */}
      <TouchableOpacity
        style={[styles.fabUnified, { backgroundColor: colors.primary }]}
        onPress={() => nav.navigate("CriarEvento" as never)}
      >
        <Ionicons
          name="add"
          size={35}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <AppText weight="700" style={{ color: "#fff" }}>
          Novo Evento
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: {},
  sectionSub: {},

  card: { borderRadius: theme.radius.lg, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  badge: { color: "#fff" },
  hora: { color: "#fff" },
  titulo: { color: "#fff", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  metaText: { color: "#fff" },
  dataForaHoje: { color: "#fff", opacity: 0.85 },

  emptyText: { color: theme.colors.muted, marginTop: 12 },

  // TTS
  fabTTS: {
    position: "absolute",
    right: 16,
    bottom: 168,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  // Export
  fabExport: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    right: 250,
    bottom: 100, // sobe mais para não colidir com a tab bar
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 24,
    elevation: 12, // Android: força ficar por cima
    zIndex: 30, // iOS: força ficar por cima
    backgroundColor: "#25D366", // cor do WhatsApp (fallback)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  // FAB "Novo Evento"
  fabUnified: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    right: 10,
    bottom: 100,
    paddingHorizontal: 22,
    height: 60,
    borderRadius: 30,
    elevation: 10,
  },
});
