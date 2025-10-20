import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SettingsProvider } from "./src/context/settings";
import { useThemeColors } from "./src/hooks/useThemeColors";
import Routes from "./src/routes/index.routes";

function AppRoot() {
  const colors = useThemeColors();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.bg, // fundo das telas
      card: colors.white, // cabeçalho/menus
      text: colors.text,
      border: "#E5E7EB",
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Routes />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppRoot />
    </SettingsProvider>
  );
}
