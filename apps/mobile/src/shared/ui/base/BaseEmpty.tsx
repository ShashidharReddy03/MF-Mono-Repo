import type { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@mf-bank/shared";
import BaseText from "./BaseText";

const BaseEmpty = ({ title, icon = "file-tray-outline", action }: { title: string; icon?: keyof typeof Ionicons.glyphMap; action?: ReactNode }) => (
  <View className="items-center gap-3 py-10">
    <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
      <Ionicons name={icon} size={26} color={colors.muted} />
    </View>
    <BaseText className="text-center text-sm text-muted">{title}</BaseText>
    {action}
  </View>
);

export default BaseEmpty;
