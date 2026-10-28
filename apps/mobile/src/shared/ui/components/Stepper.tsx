import { View } from "react-native";
import BaseText from "../base/BaseText";
import { t } from "@mf-bank/shared";

/** Compact wizard progress: segmented bar + "Step x of n · Title" */
const Stepper = ({ steps, current }: { steps: readonly string[]; current: number }) => (
  <View className="mb-5 gap-2">
    <View className="flex-row gap-1.5">
      {steps.map((s, i) => (
        <View key={s} className={`h-1.5 flex-1 rounded-full ${i <= current ? "bg-secondary" : "bg-primary/10"}`} />
      ))}
    </View>
    <BaseText weight="medium" className="text-xs text-muted">
      {t("Step {{n}} of {{total}}", { n: current + 1, total: steps.length })} · {steps[current]}
    </BaseText>
  </View>
);

export default Stepper;
