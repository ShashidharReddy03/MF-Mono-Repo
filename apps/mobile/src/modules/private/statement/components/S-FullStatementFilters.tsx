import { View } from "react-native";
import {
  minStatementDate,
  STATEMENT_MAX_MONTHS,
  STATEMENT_PRESETS,
  toDisplayDate,
  type StatementRangePreset, t } from "@mf-bank/shared";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseDatePicker from "@/shared/ui/base/BaseDatePicker";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";

type Props = {
  preset: StatementRangePreset;
  onPreset: (p: StatementRangePreset) => void;
  customRange: { from: Date | null; to: Date | null };
  onCustomRange: (r: { from: Date | null; to: Date | null }) => void;
  rangeError?: string;
  range?: { from: Date; to: Date };
  loading: boolean;
  downloading: boolean;
  onView: () => void;
  onDownload: (format: "pdf" | "xls") => void;
};

/** Period presets + custom range limited to the last 6 months (shared business rule) */
const SFullStatementFilters = (p: Props) => (
  <View className="gap-3 rounded-2xl bg-surface p-3">
    <BaseSegmented
      value={p.preset}
      onChange={p.onPreset}
      size="small"
      options={STATEMENT_PRESETS.map((x) => ({ label: x.label, value: x.key }))}
    />
    {p.preset === "custom" && (
      <View className="flex-row gap-3">
        <BaseDatePicker
          label={t("From")}
          value={p.customRange.from}
          minimumDate={minStatementDate()}
          maximumDate={new Date()}
          onChange={(d) => p.onCustomRange({ ...p.customRange, from: d })}
        />
        <BaseDatePicker
          label={t("To")}
          value={p.customRange.to}
          minimumDate={minStatementDate()}
          maximumDate={new Date()}
          onChange={(d) => p.onCustomRange({ ...p.customRange, to: d })}
        />
      </View>
    )}
    {p.preset === "custom" && p.rangeError && p.customRange.from && p.customRange.to ? (
      <BaseText className="text-xs text-danger">{p.rangeError}</BaseText>
    ) : (
      <BaseText className="text-xs text-muted">
        {p.range
          ? `${toDisplayDate(p.range.from)} – ${toDisplayDate(p.range.to)}`
          : t("Statements are available for the last {{n}} months.", { n: STATEMENT_MAX_MONTHS })}
      </BaseText>
    )}
    <BaseButton label={t("View statement")} onPress={p.onView} loading={p.loading} disabled={!p.range} />
    <View className="flex-row gap-3">
      <View className="flex-1">
        <BaseButton label="PDF" variant="secondary" size="small" onPress={() => p.onDownload("pdf")} disabled={!p.range || p.downloading} />
      </View>
      <View className="flex-1">
        <BaseButton label={t("Excel")} variant="secondary" size="small" onPress={() => p.onDownload("xls")} disabled={!p.range || p.downloading} />
      </View>
    </View>
  </View>
);

export default SFullStatementFilters;
