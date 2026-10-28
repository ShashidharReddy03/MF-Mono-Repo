import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { colors, t } from "@mf-bank/shared";
import BaseText from "./BaseText";
import BaseModal from "./BaseModal";
import BaseButton from "./BaseButton";

type Props = {
  label?: string;
  value: Date | null;
  onChange: (d: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

/** Android: native dialog. iOS: inline calendar in a bottom sheet. */
const BaseDatePicker = ({ label, value, onChange, minimumDate, maximumDate }: Props) => {
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? maximumDate ?? new Date());

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: value ?? maximumDate ?? new Date(),
        mode: "date",
        minimumDate,
        maximumDate,
        onChange: (e, d) => e.type === "set" && d && onChange(d),
      });
    } else {
      setDraft(value ?? maximumDate ?? new Date());
      setIosOpen(true);
    }
  };

  return (
    <View className="flex-1 gap-1.5">
      {label && (
        <BaseText weight="medium" className="text-xs text-muted">
          {label}
        </BaseText>
      )}
      <Pressable
        onPress={open}
        className="h-[50px] flex-row items-center justify-between rounded-xl border bg-white px-3.5"
        style={{ borderColor: `${colors.primary}26` }}
      >
        <BaseText weight="medium" className={value ? "" : "text-muted/60"}>
          {value ? dayjs(value).format("DD MMM YYYY") : "Select date"}
        </BaseText>
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
      </Pressable>

      {Platform.OS === "ios" && (
        <BaseModal open={iosOpen} onClose={() => setIosOpen(false)} title={label ?? t("Select date")} dismissable>
          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            accentColor={colors.secondary}
            onChange={(_, d) => d && setDraft(d)}
          />
          <BaseButton
            label={t("Done")}
            onPress={() => {
              onChange(draft);
              setIosOpen(false);
            }}
          />
        </BaseModal>
      )}
    </View>
  );
};

export default BaseDatePicker;
