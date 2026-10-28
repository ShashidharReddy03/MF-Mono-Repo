import { useEffect } from "react";
import { ActivityIndicator, Linking, View } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { colors, maskAccount, useStatements, type MiniFilter, type StatementDownload, type StatementMode, t } from "@mf-bank/shared";
import type { PrivateTabParamList } from "@/app/navigation/types";
import Screen from "@/shared/ui/components/Screen";
import BaseCard from "@/shared/ui/base/BaseCard";
import BaseSelect from "@/shared/ui/base/BaseSelect";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseEmpty from "@/shared/ui/base/BaseEmpty";
import TransactionRows from "@/shared/ui/components/TransactionRows";
import { toast } from "@/shared/ui/base/BaseToast";
import SSummary from "./components/S-Summary";
import SFullStatementFilters from "./components/S-FullStatementFilters";

/**
 * Server PDF/XLS → opened in the system browser.
 * Local CSV fallback → written to the cache dir, handed to the share sheet,
 * then deleted so statement data doesn't linger on the device.
 */
const saveDownload = async (file: StatementDownload) => {
  if (file.kind === "url") {
    await Linking.openURL(file.url);
    return;
  }
  const out = new File(Paths.cache, file.filename);
  try {
    if (out.exists) out.delete();
    out.create();
    out.write(file.content);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(out.uri, { mimeType: "text/csv", dialogTitle: t("Export statement") });
    } else {
      toast.error(t("Sharing is not available on this device."));
    }
  } finally {
    if (out.exists) out.delete();
  }
};

const StatementScreen = () => {
  const route = useRoute<RouteProp<PrivateTabParamList, "Statements">>();
  const s = useStatements(route.params?.account);
  const { setAccount } = s;

  // arriving from the dashboard with a specific account selected
  useEffect(() => {
    if (route.params?.account) setAccount(route.params.account);
  }, [route.params?.account, setAccount]);

  const showSummary = s.mode === "mini" ? !s.miniLoading : !!s.full;

  return (
    <Screen edges={[]} onRefresh={s.mode === "mini" ? s.reloadMini : undefined} refreshing={false}>
      <View className="gap-4">
        <BaseSelect
          label={t("Account")}
          value={s.account}
          onChange={setAccount}
          options={s.accounts.map((a) => ({ value: a.accountNumber, label: `${a.alias || a.accountName} · ${maskAccount(a.accountNumber)}` }))}
        />
        <BaseSegmented<StatementMode>
          value={s.mode}
          onChange={s.setMode}
          options={[
            { get label() { return t("Mini statement"); }, value: "mini" },
            { get label() { return t("Full statement"); }, value: "full" },
          ]}
        />

        {s.mode === "full" && (
          <SFullStatementFilters
            preset={s.preset}
            onPreset={s.setPreset}
            customRange={s.customRange}
            onCustomRange={s.setCustomRange}
            rangeError={s.rangeError}
            range={s.range}
            loading={s.fullLoading}
            downloading={s.downloading}
            onView={() => void s.loadFull()}
            onDownload={async (f) => {
              const file = await s.download(f);
              if (file) await saveDownload(file);
            }}
          />
        )}

        {showSummary && <SSummary summary={s.summary} currency={s.currency} />}

        <BaseCard>
          {s.mode === "mini" ? (
            <>
              <BaseSegmented<MiniFilter>
                value={s.miniFilter}
                onChange={s.setMiniFilter}
                size="small"
                options={[
                  { get label() { return t("All"); }, value: "ALL" },
                  { get label() { return t("Credits"); }, value: "CREDIT" },
                  { get label() { return t("Debits"); }, value: "DEBIT" },
                ]}
              />
              {s.miniLoading ? (
                <ActivityIndicator className="py-10" color={colors.secondary} />
              ) : s.miniRows.length ? (
                <TransactionRows rows={s.miniRows} currency={s.currency} />
              ) : (
                <BaseEmpty title={t("No recent transactions")} />
              )}
            </>
          ) : s.fullLoading ? (
            <ActivityIndicator className="py-10" color={colors.secondary} />
          ) : s.full ? (
            s.full.Transactions.length ? (
              <TransactionRows rows={s.full.Transactions} currency={s.full.Currency} />
            ) : (
              <BaseEmpty title={t("No transactions in this period")} />
            )
          ) : (
            <BaseEmpty icon="calendar-outline" title={t("Choose a period and tap “View statement”.")} />
          )}
        </BaseCard>
      </View>
    </Screen>
  );
};

export default StatementScreen;
