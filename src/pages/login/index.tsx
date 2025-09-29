import React, { useState } from "react";
import {Text, View, Image, TextInput, TouchableOpacity, Linking, Alert} from 'react-native';
import { style } from "./styles";
import logo from '../../assets/logoMarca.png'
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { themas } from "../../global/themes";
import { supabase } from '../../../lib/supabase'




export default function Login() {

  const [loading, setLoading] = useState(false);
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');

  async function getLogin() {
    try {
      if (!email || !pass) {
        Alert.alert('Atenção', 'Preencha e-mail e senha.');
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('usuarios')
        .select('id, login, password')        
        .eq('login', email)
        .eq('password', pass)                
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        Alert.alert('Ops', 'Credenciais inválidas.');
        return;
      }

      // Sucesso: aqui você decide o que fazer
      // await AsyncStorage.setItem('@user', JSON.stringify(data));
      // navigation.navigate('Home' as never); // caso use React Navigation
      Alert.alert('Bem-vindo!', `Olá, ${data.login ?? 'usuário'}!`);
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  } 
    
    return (
        <View style={style.container}>
            <View style={style.boxTop}>
                <Image 
                    source={logo}
                    style={style.logo}
                    resizeMode="contain"
                />
                <Text style={style.title}>EducAgenda</Text>
                <Text style={style.subtitle}>Sua agenda inclusiva!</Text>
            </View>
            <View style={style.boxMid}>
                <Text style={style.titleInput}>E-mail</Text>
                <View style={style.boxInput}>
                    <TextInput 
                    style={style.input}
                    value={email}
                    onChangeText={setEmail}
                    />
                    <MaterialIcons
                        name="email"
                        size={20}
                        color={themas.colors.secundary}
                    />
                </View>
                <Text style={style.titleInput}>Senha</Text>
                <View style={style.boxInput}>
                    <TextInput 
                    style={style.input}
                    value={pass}
                    onChangeText={setPass}
                    />
                    <MaterialIcons
                        name="remove-red-eye"
                        size={20}
                        color={themas.colors.secundary}
                    />
                </View>
            </View>
            <View style={style.boxBottom}>
                <TouchableOpacity style={style.button} onPress={() => getLogin()}>
                    <Text style={style.textButton}>
                        Entrar
                    </Text>
                </TouchableOpacity>
                <Text style={style.link} onPress={() => Linking.openURL('www.google.com.br')}>
                Esqueceu sua senha?
                </Text>
            </View>
        </View>
    )
}