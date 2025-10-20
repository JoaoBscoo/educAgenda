import React, { useState } from "react";
import { Text, View, Image, Linking, Alert } from "react-native";
import { style } from "./styles";
import logo from "../../assets/logoMarca.png";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function Login() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(true);

  async function getLogin() {
    try {
      if (!email || !pass) {
        Alert.alert("Atenção", "Preencha e-mail e senha.");
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, login, password")
        .eq("login", email)
        .eq("password", pass)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        Alert.alert("Ops", "Credenciais inválidas.");
        return;
      }

      // Exibe mensagem
      Alert.alert("Bem-vindo!", `Olá, ${data.login ?? "usuário"}!`);

      // 🚀 Redireciona e limpa o histórico (não permite voltar pro login)
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } catch (err: any) {
      Alert.alert("Erro ao entrar", err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={style.container}>
      <View style={style.boxTop}>
        <Image source={logo} style={style.logo} resizeMode="contain" />
        <Text style={style.title}>EducAgenda</Text>
        <Text style={style.subtitle}>Sua agenda inclusiva!</Text>
      </View>

      <View style={style.boxMid}>
        <Input
          title="E-mail"
          onChangeText={setEmail}
          IconRight={MaterialIcons}
          iconRightName="email"
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
      </View>
      <View style={style.boxBottom}>
        <Button text="Entrar" loading={loading} onPress={() => getLogin()} />
        <Text
          style={style.link}
          onPress={() => Linking.openURL("www.google.com.br")}
        >
          Esqueceu sua senha?
        </Text>
      </View>
    </View>
  );
}
