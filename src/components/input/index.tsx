import React, { forwardRef, LegacyRef } from "react";
import {
  Text,
  View,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { theme } from "../../global/themes";
import { style } from "../../components/input/styles";
import { MaterialIcons, FontAwesome, Octicons } from "@expo/vector-icons";
import { Icon } from "@rneui/themed";
import { useThemeColors } from "../../hooks/useThemedColors";

type IconComponent =
  | React.ComponentType<React.ComponentProps<typeof MaterialIcons>>
  | React.ComponentType<React.ComponentProps<typeof FontAwesome>>
  | React.ComponentType<React.ComponentProps<typeof Octicons>>;

type Props = TextInputProps & {
  IconLeft?: IconComponent;
  IconRight?: IconComponent;
  iconLeftName?: string;
  iconRightName?: string;
  title?: string;
  onIconLeftPress?: () => void;
  onIconRightPress?: () => void;
};

export const Input = forwardRef(
  (Props: Props, ref: LegacyRef<TextInput> | null) => {
    const {
      IconLeft,
      iconLeftName,
      iconRightName,
      IconRight,
      onIconLeftPress,
      onIconRightPress,
      title,
      ...rest
    } = Props;

    const calculateSizeWidth = () => {
      if (IconLeft && IconRight) {
        return "80%";
      } else if (IconLeft || IconRight) {
        return "90%";
      } else {
        return "100%";
      }
    };

    const calculateSizePaddingLeft = () => {
      if (IconLeft && IconRight) {
        return 0;
      } else if (IconLeft || IconRight) {
        return 10;
      } else {
        return 20;
      }
    };

    return (
      <>
        {title && <Text style={style.titleInput}>{title}</Text>}
        <View style={[style.boxInput, { padding: calculateSizePaddingLeft() }]}>
          {IconLeft && iconLeftName && (
            <TouchableOpacity onPress={onIconLeftPress}>
              <IconLeft
                name={iconLeftName as any}
                size={20}
                color={theme.colors.primary}
                style={style.Icon}
              />
            </TouchableOpacity>
          )}
          <TextInput
            style={[style.input, { width: calculateSizeWidth() }]}
            {...rest}
          />
          {IconRight && iconRightName && (
            <TouchableOpacity onPress={onIconRightPress}>
              <IconRight
                name={iconRightName as any}
                size={20}
                color={theme.colors.primary}
                style={style.Icon}
              />
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  }
);
