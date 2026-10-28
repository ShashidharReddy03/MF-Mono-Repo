import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

/** White surface with the app's hairline border */
const BaseCard = ({ children, className = "", ...rest }: ViewProps & { children: ReactNode; className?: string }) => (
  <View className={`rounded-2xl border border-primary/10 bg-white p-4 ${className}`} {...rest}>
    {children}
  </View>
);

export default BaseCard;
