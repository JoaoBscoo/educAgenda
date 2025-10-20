import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../../../lib/supabase";
import { theme } from "../../global/themes";
import type { RootStackParamList } from "../../routes/index.routes";

const CATEGORIAS = [
  "Pessoal",
  "Trabalho",
  "Saúde",
  "Educação",
  "Outro",
] as const;
type RouteP = RouteProp<RootStackParamList, "EditarEvento">;

export default function EventEdit() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    params: { id },
  } = useRoute<RouteP>();

  const [titulo, setTitulo] = useState("");
  const [local, setLocal] = useState("");
  const [categoria, setCategoria] =
    useState<(typeof CATEGORIAS)[number]>("Pessoal");
  const [minutosAntecedencia, setMinutosAntecedencia] = useState("10");
  const [data, setData] = useState<Date>(new Date());
  const [hora, setHora] = useState<Date>(new Date());

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempTime, setTempTime] = useState<Date>(new Date());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("agendamentos")
          .select("titulo,horario,local,minutos_antecedencia,categoria")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Evento não encontrado.");

        const dt = new Date(data.horario);
        setTitulo(data.titulo ?? "");
        setLocal(data.local ?? "");
        setCategoria((data.categoria as any) ?? "Pessoal");
        setMinutosAntecedencia(String(data.minutos_antecedencia ?? 10));
        setData(dt);
        setHora(dt);
      } catch (e: any) {
        Alert.alert("Erro", e.message ?? String(e));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  const dataFormatada = format(data, "dd/MM/yyyy", { locale: ptBR });
  const horaFormatada = format(hora, "HH:mm", { locale: ptBR });

  async function salvar() {
    try {
      if (!titulo.trim()) {
        Alert.alert("Atenção", "Informe um título para o evento.");
        return;
      }
      const combinado = new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate(),
        hora.getHours(),
        hora.getMinutes(),
        0,
        0
      );
      setSaving(true);
      const { error } = await supabase
        .from("agendamentos")
        .update({
          titulo: titulo.trim(),
          horario: combinado.toISOString(),
          local: local.trim() || null,
          minutos_antecedencia: Math.max(0, Number(minutosAntecedencia) || 10),
          categoria,
        })
        .eq("id", id);
      if (error) throw error;

      Alert.alert("Sucesso", "Evento atualizado.");
      navigation.goBack(); // volta ao Detalhe
    } catch (e: any) {
      Alert.alert("Erro ao salvar", e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>Carregando…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]} // espaço pros botões
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Consulta Médica"
            value={titulo}
            onChangeText={setTitulo}
            placeholderTextColor="#9AA0A6"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Data</Text>
              <TouchableOpacity
                style={styles.btnField}
                onPress={() => {
                  setTempDate(data);
                  setShowDate(true);
                }}
              >
                <Ionicons name="calendar" size={18} color="#111827" />
                <Text style={styles.btnFieldText}>{dataFormatada}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Hora</Text>
              <TouchableOpacity
                style={styles.btnField}
                onPress={() => {
                  setTempTime(hora);
                  setShowTime(true);
                }}
              >
                <Ionicons name="time" size={18} color="#111827" />
                <Text style={styles.btnFieldText}>{horaFormatada}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Local</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Hospital São José"
            value={local}
            onChangeText={setLocal}
            placeholderTextColor="#9AA0A6"
          />

          {/* Categoria aumentada */}
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.pickerBox}>
            <Picker
              style={styles.picker}
              itemStyle={styles.picker}
              mode={Platform.OS === "android" ? "dropdown" : undefined}
              selectedValue={categoria}
              onValueChange={(v) => setCategoria(v)}
              dropdownIconColor="#111827"
            >
              {CATEGORIAS.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Avisar antes (minutos)</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            value={minutosAntecedencia}
            onChangeText={setMinutosAntecedencia}
            placeholderTextColor="#9AA0A6"
            keyboardType="numeric"
            maxLength={3}
          />
        </ScrollView>

        {/* Barra de ações fixa (respeita safe area) */}
        <View
          style={[styles.actionsBar, { paddingBottom: 16 + insets.bottom }]}
        >
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={[styles.btnText, { color: theme.colors.primary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={salvar}
            disabled={saving}
          >
            <Text style={[styles.btnText, { color: "#fff" }]}>
              {saving ? "Salvando..." : "Salvar"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* MODAL: Data */}
      <Modal
        transparent
        visible={showDate}
        animationType="fade"
        onRequestClose={() => setShowDate(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecione a data</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              themeVariant="light"
              onChange={(_, d) => d && setTempDate(d)}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btnSmall, styles.btnOutline]}
                onPress={() => setShowDate(false)}
              >
                <Text
                  style={[styles.btnSmallText, { color: theme.colors.primary }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSmall, styles.btnPrimary]}
                onPress={() => {
                  setData(tempDate);
                  setShowDate(false);
                }}
              >
                <Text style={[styles.btnSmallText, { color: "#fff" }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Hora */}
      <Modal
        transparent
        visible={showTime}
        animationType="fade"
        onRequestClose={() => setShowTime(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecione a hora</Text>
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour
              display="spinner"
              themeVariant="light"
              onChange={(_, d) => d && setTempTime(d)}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btnSmall, styles.btnOutline]}
                onPress={() => setShowTime(false)}
              >
                <Text
                  style={[styles.btnSmallText, { color: theme.colors.primary }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSmall, styles.btnPrimary]}
                onPress={() => {
                  setHora(tempTime);
                  setShowTime(false);
                }}
              >
                <Text style={[styles.btnSmallText, { color: "#fff" }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16 },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  btnField: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnFieldText: { fontSize: 16, color: "#111827", fontWeight: "600" },
  pickerBox: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    overflow: "hidden",
    height: 90,
    justifyContent: "center",
  },
  picker: { height: 90, color: "#111827" },

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
  btnOutline: {
    backgroundColor: theme.colors.secundary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnText: { fontSize: 16, color: "#111827", fontWeight: "600" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: theme.colors.text,
  },
  modalActions: { marginTop: 8, flexDirection: "row", gap: 12 },
  btnSmall: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSmallText: { fontSize: 15, fontWeight: "700" },
});
