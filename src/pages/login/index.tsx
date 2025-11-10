import React, { useState } from "react";
import { Text, View, Image, Alert, TouchableOpacity } from "react-native";
import { style } from "./styles";
import logo from "../../assets/logoMarca.png";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { useNavigation, NavigationProp } from "@react-navigation/native";

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

      Alert.alert("Bem-vindo!", `Olá, ${data.login ?? "usuário"}!`);

      // Reseta navegação (não permite voltar ao login)
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
      </View>

      <View style={style.boxBottom}>
        <Button text="Entrar" loading={loading} onPress={getLogin} />

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword" as never)}
        >
          <Text style={[style.link, { marginTop: 30 }]}>
            Esqueceu sua senha?
          </Text>
        </TouchableOpacity>
        <View></View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register" as never)}
        >
          <Text style={[style.link, { marginTop: 40 }]}>Criar uma conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
