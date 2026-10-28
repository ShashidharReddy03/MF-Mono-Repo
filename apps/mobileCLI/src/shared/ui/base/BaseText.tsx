import { Text, type TextProps } from "react-native";
import { FONTS, type FontWeight } from "@/core/config/fonts";

export type BaseTextProps = TextProps & { weight?: FontWeight; className?: string };

const BaseText = ({ weight = "regular", className = "", style, ...rest }: BaseTextProps) => (
  <Text maxFontSizeMultiplier={1.4} className={`text-primary ${className}`} style={[{ fontFamily: FONTS[weight] }, style]} {...rest} />
);

export default BaseText;
