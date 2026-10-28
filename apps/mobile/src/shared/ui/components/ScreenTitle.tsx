import type { ReactNode } from "react";
import { View } from "react-native";
import BaseText from "../base/BaseText";

const ScreenTitle = ({ title, description, right }: { title: string; description?: string; right?: ReactNode }) => (
  <View className="mb-5 flex-row items-end justify-between gap-3">
    <View className="flex-1">
      <BaseText weight="bold" className="text-2xl">
        {title}
      </BaseText>
      {description && <BaseText className="mt-1 text-sm text-muted">{description}</BaseText>}
    </View>
    {right}
  </View>
);

export default ScreenTitle;
