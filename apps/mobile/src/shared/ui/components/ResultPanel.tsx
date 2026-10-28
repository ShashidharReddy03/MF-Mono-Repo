import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, type DetailsItem } from "@mf-bank/shared";
import BaseText from "../base/BaseText";
import BaseButton from "../base/BaseButton";
import DetailsList from "./DetailsList";

type Props = {
  title: string;
  message?: string;
  details?: DetailsItem[];
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** "error" for a failed outcome (server Status 06) */
  status?: "success" | "error";
};

const ResultPanel = ({ title, message, details, actionLabel, onAction, secondaryLabel, onSecondary, status = "success" }: Props) => (
  <View className="gap-4">
    <View className="items-center gap-2 py-4">
      <View className={`h-16 w-16 items-center justify-center rounded-full ${status === "error" ? "bg-danger/10" : "bg-secondary-light"}`}>
        <Ionicons name={status === "error" ? "close" : "checkmark"} size={34} color={status === "error" ? colors.danger : colors.secondaryDark} />
      </View>
      <BaseText weight="bold" className="text-center text-lg">
        {title}
      </BaseText>
      {message && <BaseText className="text-center text-sm text-muted">{message}</BaseText>}
    </View>
    <DetailsList items={details} />
    <BaseButton label={actionLabel} onPress={onAction} />
    {secondaryLabel && onSecondary && <BaseButton label={secondaryLabel} variant="secondary" onPress={onSecondary} />}
  </View>
);

export default ResultPanel;
