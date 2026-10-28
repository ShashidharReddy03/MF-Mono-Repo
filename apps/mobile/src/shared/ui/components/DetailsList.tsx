import { View } from "react-native";
import type { DetailsItem } from "@mf-bank/shared";
import BaseText from "../base/BaseText";

const DetailsList = ({ items }: { items?: DetailsItem[] }) =>
  items?.length ? (
    <View className="rounded-xl border border-primary/10 bg-white">
      {items.map((d, i) => (
        <View key={d.label} className={`flex-row justify-between gap-4 px-4 py-3 ${i ? "border-t border-primary/5" : ""}`}>
          <BaseText className="text-sm text-muted">{d.label}</BaseText>
          {/* items-end follows layout direction: right in English, left in Arabic */}
          <View className="flex-1 items-end">
            <BaseText weight="semibold" className="text-sm">
            {d.value}
            </BaseText>
          </View>
        </View>
      ))}
    </View>
  ) : null;

export default DetailsList;
