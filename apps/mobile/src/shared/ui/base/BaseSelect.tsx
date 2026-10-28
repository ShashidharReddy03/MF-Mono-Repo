import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, type SelectOption, t } from "@mf-bank/shared";
import BaseText from "./BaseText";
import BaseInput from "./BaseInput";
import BaseModal from "./BaseModal";

type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  error?: string;
  searchable?: boolean;
};

/** Field that opens a searchable bottom-sheet list (antd Select equivalent) */
const BaseSelect = ({ label, placeholder = t("Select"), value, onChange, options, error, searchable = options.length > 8 }: Props) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase())),
    [options, q],
  );

  return (
    <View className="gap-1.5">
      {label && (
        <BaseText weight="medium" className="text-sm">
          {label}
        </BaseText>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        className="min-h-[50px] flex-row items-center rounded-xl border bg-white px-3.5 py-2"
        style={{ borderColor: error ? colors.danger : `${colors.primary}26` }}
      >
        <BaseText weight="medium" className={`flex-1 text-[15px] ${selected ? "" : "text-muted/60"}`} numberOfLines={2}>
          {selected?.label ?? placeholder}
        </BaseText>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      {error && <BaseText className="text-xs text-danger">{error}</BaseText>}

      <BaseModal open={open} onClose={() => setOpen(false)} title={label ?? placeholder} dismissable>
        {searchable && (
          <View className="mb-3">
            <BaseInput placeholder={t("Search")} value={q} onChangeText={setQ} left={<Ionicons name="search" size={18} color={colors.muted} style={{ marginRight: 8 }} />} />
          </View>
        )}
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.value}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View className="h-px bg-primary/5" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onChange(item.value);
                setOpen(false);
                setQ("");
              }}
              className="flex-row items-center gap-3 py-3.5"
            >
              <BaseText weight={item.value === value ? "semibold" : "regular"} className="flex-1 text-[15px]">
                {item.label}
              </BaseText>
              {item.value === value && <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />}
            </Pressable>
          )}
          ListEmptyComponent={<BaseText className="py-6 text-center text-muted">{t("No matches")}</BaseText>}
        />
      </BaseModal>
    </View>
  );
};

export default BaseSelect;
