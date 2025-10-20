import { Dimensions, StyleSheet } from "react-native";
import { theme } from "../../global/themes";
import { useThemeColors } from "../../hooks/useThemeColors";

export const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  boxTop: {
    height: Dimensions.get("window").height / 3,
    width: "100%",
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  boxMid: {
    height: Dimensions.get("window").height / 4,
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 37,
  },
  boxBottom: {
    height: Dimensions.get("window").height / 3,
    width: "100%",
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontWeight: "800",
    fontSize: 40,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 10,
  },
  titleInput: {
    fontSize: 15,
    marginLeft: 10,
    marginTop: 20,
    color: "grey",
    fontWeight: "bold",
  },
  boxInput: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderRadius: 40,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.background,
    paddingHorizontal: 5,
  },
  input: {
    height: "100%",
    width: "90%",
    borderRadius: 40,
    paddingLeft: 5,
  },
  button: {
    width: "80%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secundary,
    borderRadius: 40,
    borderColor: theme.colors.secundary,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    marginBottom: 20,
  },
  textButton: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  link: {
    fontSize: 15,
    color: "blue",
    textDecorationLine: "underline",
  },
  Icon: {
    width: "100%",
  },
});
