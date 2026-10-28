import { View } from "react-native";
import BaseText from "../base/BaseText";
import { t } from "@mf-bank/shared";

/** Same wordmark as web: monogram tile + name */
const Logo = ({ light = false, compact = false }: { light?: boolean; compact?: boolean }) => (
  <View className="flex-row items-center gap-2.5">
    <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
      <BaseText weight="bold" className="text-sm text-white">
        MF
      </BaseText>
    </View>
    {!compact && (
      <View>
        <BaseText weight="bold" className={`text-base ${light ? "text-white" : ""}`}>
          MF Bank
        </BaseText>
        <BaseText weight="medium" className={`text-2xs ${light ? "text-white/60" : "text-muted"}`}>
          {t("Mobile Banking")}
        </BaseText>
      </View>
    )}
  </View>
);

export default Logo;
