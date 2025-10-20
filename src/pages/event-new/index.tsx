// src/pages/event-new/index.tsx
import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { theme } from "../../global/themes";
import { useThemeColors } from "../../hooks/useThemeColors";

const CATEGORIAS = [
  "Pessoal",
  "Trabalho",
  "Saúde",
  "Educação",
  "Outro",
] as const;

export default function EventNew() {
  const navigation = useNavigation();
  const [titulo, setTitulo] = useState("");
  const colors = useThemeColors();
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
  const [saving, setSaving] = useState(false);
  const currentUserId: number | null = null;

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
        hora.getMinutes()
      );

      const payload = {
        titulo: titulo.trim(),
        horario: combinado.toISOString(),
        local: local.trim() || null,
        minutos_antecedencia: Math.max(0, Number(minutosAntecedencia) || 10),
        categoria,
        usuario_id: currentUserId,
      };

      setSaving(true);
      const { error } = await supabase.from("agendamentos").insert(payload);
      if (error) throw error;

      Alert.alert("Sucesso", "Evento criado com sucesso!");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erro ao salvar", e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
                onPress={() => setShowDate(true)}
              >
                <Ionicons name="calendar" size={18} color="#111827" />
                <Text style={styles.btnFieldText}>{dataFormatada}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Hora</Text>
              <TouchableOpacity
                style={styles.btnField}
                onPress={() => setShowTime(true)}
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

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={[styles.btnText, { color: "#007AFF" }]}>Cancelar</Text>
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

        {/* MODAL: Data */}
        <Modal transparent visible={showDate} animationType="fade">
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
                  <Text style={[styles.btnSmallText, { color: "#007AFF" }]}>
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
                  <Text style={[styles.btnSmallText, { color: "#fff" }]}>
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: Hora */}
        <Modal transparent visible={showTime} animationType="fade">
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
                  <Text style={[styles.btnSmallText, { color: "#007AFF" }]}>
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
                  <Text style={[styles.btnSmallText, { color: "#fff" }]}>
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 0 },
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

  // Categoria com área ampliada
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
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: "#007AFF" },
  btnOutline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  btnText: { fontSize: 16, fontWeight: "700" },
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
