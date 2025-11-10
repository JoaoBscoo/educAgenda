import React, { useState } from "react";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import logo from "../../assets/logoMarca.png";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../routes/index.routes";
import { style } from "./styles";
export default function ForgotPassword() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirm, setShowConfirm] = useState(true);

  async function handleReset() {
    try {
      if (!email || !pass || !confirm) {
        Alert.alert("Atenção", "Preencha e-mail e as senhas.");
        return;
      }
      if (pass.length < 6) {
        Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (pass !== confirm) {
        Alert.alert("Atenção", "A confirmação de senha não confere.");
        return;
      }

      setLoading(true);

      const { data: user, error: findErr } = await supabase
        .from("usuarios")
        .select("id")
        .eq("login", email)
        .maybeSingle();

      if (findErr) throw findErr;
      if (!user) {
        Alert.alert("Ops", "Não encontramos esse e-mail.");
        return;
      }

      const { error: updErr } = await supabase
        .from("usuarios")
        .update({ password: pass })
        .eq("id", user.id);

      if (updErr) throw updErr;

      Alert.alert("Senha atualizada!", "Faça login com sua nova senha.", [
        {
          text: "Ir para Login",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Erro", err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: "center" }}>
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
          Esqueceu sua senha?
        </Text>
        <Text style={{ opacity: 0.7 }}>Preencha seus dados para recomeçar</Text>
      </View>
      <Input
        title="Login"
        value={email}
        onChangeText={setEmail}
        IconRight={MaterialIcons}
        iconRightName="email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        title="Nova senha"
        value={pass}
        onChangeText={setPass}
        IconRight={Octicons}
        iconRightName={showPassword ? "eye-closed" : "eye"}
        secureTextEntry={showPassword}
        onIconRightPress={() => setShowPassword(!showPassword)}
      />

      <Input
        title="Confirmar nova senha"
        value={confirm}
        onChangeText={setConfirm}
        IconRight={Octicons}
        iconRightName={showConfirm ? "eye-closed" : "eye"}
        secureTextEntry={showConfirm}
        onIconRightPress={() => setShowConfirm(!showConfirm)}
      />
      <View></View>
      <View style={style.boxBottom}>
        <Button
          text="Atualizar senha"
          loading={loading}
          onPress={handleReset}
        />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16, alignItems: "center" }}
        >
          <Text style={{ color: "#1D4ED8", fontSize: 16 }}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ BOTÃO VOLTAR */}
    </View>
  );
}
