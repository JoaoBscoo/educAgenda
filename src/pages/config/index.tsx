import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/app-header";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../../global/themes";
import { useSettings, ts } from "../../context/settings";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function Config() {
  const {
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    ttsEnabled,
    setTtsEnabled,
  } = useSettings();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  function handleLogout() {
    Alert.alert("Sair do aplicativo", "Tem certeza de que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          // Aqui limpamos o histórico e voltamos ao login
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Cabeçalho */}
      <LinearGradient
        colors={[theme.colors.gradStart, theme.colors.gradEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <AppHeader
          title="EducAgenda"
          subtitle="Configurações e Acessibilidade"
        />
      </LinearGradient>

      {/* Acessibilidade */}
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: ts(16, fontScale), color: colors.text },
          ]}
        >
          Acessibilidade
        </Text>

        {/* Alto contraste */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.rowTitle,
                { fontSize: ts(15, fontScale), color: colors.text },
              ]}
            >
              Alto Contraste
            </Text>
            <Text style={{ color: colors.muted, fontSize: ts(13, fontScale) }}>
              Aumenta o contraste para melhor visibilidade
            </Text>
          </View>
          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            thumbColor={highContrast ? colors.primary : "#fff"}
            trackColor={{ true: "#c7dafc", false: "#D1D5DB" }}
          />
        </View>

        {/* Tamanho da fonte */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.rowTitle,
                { fontSize: ts(15, fontScale), color: colors.text },
              ]}
            >
              Tamanho da Fonte
            </Text>
            <Text style={{ color: colors.muted, fontSize: ts(13, fontScale) }}>
              Ajuste o tamanho de todos os textos
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: colors.muted, fontSize: ts(12, fontScale) }}>
              {Math.round(fontScale * 100)}%
            </Text>
          </View>
        </View>
        <Slider
          minimumValue={0.9}
          maximumValue={1.6}
          step={0.05}
          value={fontScale}
          onValueChange={setFontScale}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#D1D5DB"
          thumbTintColor={colors.primary}
          style={{ marginTop: 6 }}
        />

        {/* Leitura em voz alta */}
        <View style={[styles.row, { marginTop: 16 }]}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.rowTitle,
                { fontSize: ts(15, fontScale), color: colors.text },
              ]}
            >
              Leitura em Voz Alta
            </Text>
            <Text style={{ color: colors.muted, fontSize: ts(13, fontScale) }}>
              Adiciona um botão para ler os eventos do dia em voz alta
            </Text>
          </View>
          <Switch
            value={ttsEnabled}
            onValueChange={setTtsEnabled}
            thumbColor={ttsEnabled ? colors.primary : "#fff"}
            trackColor={{ true: "#c7dafc", false: "#D1D5DB" }}
          />
        </View>
      </View>
      <View></View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginTop: 20,
    marginBottom: 70,
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 40,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
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
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    elevation: 1,
  },
  title: { fontWeight: "800" },
  pillBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sectionTitle: { fontWeight: "800", marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  rowTitle: { fontWeight: "700" },
});
