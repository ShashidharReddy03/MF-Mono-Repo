import { useLayoutEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Modal } from "@ant-design/react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BENEFICIARY_TYPE_LABEL,
  colors,
  initials,
  useBeneficiaries,
  type Beneficiary,
  type BeneficiaryFilter, t } from "@mf-bank/shared";
import BaseInput from "@/shared/ui/base/BaseInput";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseEmpty from "@/shared/ui/base/BaseEmpty";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";
import BDetailsSheet from "./components/B-DetailsSheet";

/** Same shared useBeneficiaries hook as the web beneficiary-page */
const BeneficiaryScreen = () => {
  const navigation = useNavigation();
  const b = useBeneficiaries();
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const openAdd = () => navigation.navigate("AddBeneficiary");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={openAdd} hitSlop={10} className="me-4" accessibilityLabel={t("Add beneficiary")}>
          <Ionicons name="person-add-outline" size={22} color={colors.primary} />
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const confirmDelete = (ben: Beneficiary) =>
    Modal.alert(t("Delete beneficiary?"), t("{{name}} ({{account}}) will be removed. You can add them again later.", { name: ben.beneficiaryName, account: ben.maskedAcno }), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Delete"),
        style: { color: colors.danger },
        onPress: async () => {
          if (await b.remove(ben)) setSelected(null);
        },
      },
    ]);

  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={b.filtered}
        keyExtractor={(x) => x.benid}
        refreshing={b.loading && !!b.list.length}
        onRefresh={b.refresh}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-5 pb-10 pt-2"
        ListHeaderComponent={
          <View className="mb-3 gap-3">
            <BaseInput
              placeholder={t("Search name, nickname or account")}
              value={b.search}
              onChangeText={b.setSearch}
              left={<Ionicons name="search" size={18} color={colors.muted} style={{ marginRight: 8 }} />}
            />
            <BaseSegmented<BeneficiaryFilter>
              value={b.typeFilter}
              onChange={b.setTypeFilter}
              size="small"
              options={[
                { label: `${t("All")} (${b.counts.ALL})`, value: "ALL" },
                { label: `${BENEFICIARY_TYPE_LABEL.SCU} (${b.counts.SCU})`, value: "SCU" },
                { label: `${BENEFICIARY_TYPE_LABEL.LOCAL} (${b.counts.LOCAL})`, value: "LOCAL" },
              ]}
            />
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item: ben }) => (
          <Pressable onPress={() => setSelected(ben)} className="flex-row items-center gap-3 rounded-2xl border border-primary/10 bg-white p-3.5">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/5">
              <BaseText weight="bold" className="text-sm">
                {initials(ben.beneficiaryName)}
              </BaseText>
            </View>
            <View className="flex-1">
              <BaseText weight="semibold" className="text-sm" numberOfLines={1}>
                {ben.beneficiaryName}
              </BaseText>
              <BaseText className="text-xs text-muted" numberOfLines={1}>
                {ben["Alias Name"]} · {ben.beneficiaryBank || BENEFICIARY_TYPE_LABEL[ben.Type]} · {ben.maskedAcno}
              </BaseText>
            </View>
            <Pressable onPress={() => confirmDelete(ben)} hitSlop={8} accessibilityLabel={t("Delete {{name}}", { name: ben.beneficiaryName })} className="p-1.5">
              <Ionicons name="trash-outline" size={18} color={colors.muted} />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          b.loading ? (
            <ActivityIndicator className="py-10" color={colors.secondary} />
          ) : (
            <BaseEmpty
              icon="people-outline"
              title={b.list.length ? t("No beneficiaries match your search") : t("You haven't added any beneficiaries yet")}
              action={!b.list.length ? <BaseButton label={t("Add beneficiary")} size="small" onPress={openAdd} /> : undefined}
            />
          )
        }
      />
      <BDetailsSheet beneficiary={selected} onClose={() => setSelected(null)} onDelete={confirmDelete} />
    </View>
  );
};

export default BeneficiaryScreen;
