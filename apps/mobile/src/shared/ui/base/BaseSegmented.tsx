import { Pressable, View } from "react-native";
import BaseText from "./BaseText";

type Props<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
  size?: "small" | "default";
};

/** Pill toggle (antd Segmented equivalent) */
function BaseSegmented<T extends string>({ value, onChange, options, size = "default" }: Props<T>) {
  return (
    <View className="flex-row rounded-xl bg-surface p-1" accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center rounded-lg ${size === "small" ? "py-1.5" : "py-2.5"} ${active ? "bg-white" : ""}`}
            style={active ? { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : undefined}
          >
            <BaseText weight={active ? "semibold" : "medium"} className={`text-xs ${active ? "text-primary" : "text-muted"}`} numberOfLines={1}>
              {o.label}
            </BaseText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default BaseSegmented;
