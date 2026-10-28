import { Text, type TextProps } from "react-native";
import { FONTS, type FontWeight } from "@/core/config/fonts";

export type BaseTextProps = TextProps & { weight?: FontWeight; className?: string };

/** Every piece of text goes through here so the brand font is always applied */
const BaseText = ({ weight = "regular", className = "", style, ...rest }: BaseTextProps) => (
  <Text
    // Large system font scales are respected, but capped so layouts don't break
    maxFontSizeMultiplier={1.4}
    className={`text-primary ${className}`}
    style={[{ fontFamily: FONTS[weight] }, style]}
    {...rest}
  />
);

export default BaseText;
