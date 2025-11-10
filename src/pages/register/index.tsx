import React, { useState } from "react";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import logo from "../../assets/logoMarca.png";
import { style } from "./styles";
import { useNavigation, NavigationProp } from "@react-navigation/native";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirm, setShowConfirm] = useState(true);

  async function handleRegister() {
    try {
      if (!nome || !email || !pass || !confirm) {
        Alert.alert("Atenção", "Preencha todos os campos.");
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

      // Verifica se já existe usuário com o mesmo login
      const { data: existing, error: checkErr } = await supabase
        .from("usuarios")
        .select("id")
        .eq("login", email)
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existing) {
        Alert.alert("Ops", "Já existe um usuário com esse e-mail.");
        return;
      }

      // Insere novo usuário
      const { error: insertErr } = await supabase.from("usuarios").insert({
        login: email,
        password: pass, // ⚠️ plaintext (mesmo padrão do seu login atual)
        nome: nome,
        ativo: true,
        criado_em: new Date().toISOString(),
      });

      if (insertErr) throw insertErr;

      Alert.alert("Conta criada!", "Agora você já pode fazer login.");
    } catch (err: any) {
      Alert.alert("Erro no cadastro", err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: "center" }}>
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <View></View>
        <View></View>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 90 }}>
          Criar conta
        </Text>
        <Text style={{ opacity: 0.7 }}>Preencha seus dados para começar</Text>
      </View>

      <Input
        title="Nome"
        value={nome}
        onChangeText={setNome}
        IconRight={MaterialIcons}
        iconRightName="person"
      />

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
        title="Senha"
        value={pass}
        onChangeText={setPass}
        IconRight={Octicons}
        iconRightName={showPassword ? "eye-closed" : "eye"}
        secureTextEntry={showPassword}
        onIconRightPress={() => setShowPassword(!showPassword)}
      />

      <Input
        title="Confirmar senha"
        value={confirm}
        onChangeText={setConfirm}
        IconRight={Octicons}
        iconRightName={showConfirm ? "eye-closed" : "eye"}
        secureTextEntry={showConfirm}
        onIconRightPress={() => setShowConfirm(!showConfirm)}
      />

      <View style={style.boxBottom}>
        <Button text="Criar conta" loading={loading} onPress={handleRegister} />
      </View>
    </View>
  );
}
