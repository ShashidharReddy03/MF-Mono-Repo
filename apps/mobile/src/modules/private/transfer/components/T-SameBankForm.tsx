import { useEffect } from "react";
import { View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { colors, t, validators, type FundTransfer, type SameBankTransferForm } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";
import { TAmountFields, TBeneficiarySource, TContactAndSave, TFromAccount, TSavedBeneficiary } from "./T-CommonFields";

const EMPTY: SameBankTransferForm = { transferType: "OnceOff", fromAccount: "", amount: "", narration: "", purpose: "", accNum: "", bene: "", mobileNumber: "", email: "", saveBene: false, alias: "" };

/** To another MF Bank account — new (verified) or saved beneficiary */
const TSameBankForm = ({ ft }: { ft: FundTransfer }) => {
  const { control, handleSubmit, trigger, getValues, setError, reset, resetField } = useForm<SameBankTransferForm>({
    defaultValues: { ...EMPTY, fromAccount: ft.accountOptions[0]?.value ?? "", ...(ft.draft as Partial<SameBankTransferForm>) },
    mode: "onTouched",
    shouldUnregister: true,
  });
  const from = useWatch({ control, name: "fromAccount" });
  const source = useWatch({ control, name: "transferType" });
  const accNum = useWatch({ control, name: "accNum" });

  // a different account number needs verifying again
  const { verified, clearVerified } = ft;
  useEffect(() => {
    if (verified && accNum !== verified["Account Number"]) clearVerified();
  }, [accNum, verified, clearVerified]);
  // demo: switching new/saved clears the beneficiary-specific fields
  useEffect(() => {
    (["accNum", "bene", "mobileNumber", "email", "saveBene", "alias"] as const).forEach((f) => resetField(f));
  }, [source, resetField]);

  const verify = async () => {
    if (await trigger("accNum")) await ft.verifyAccount(getValues("accNum") ?? "");
  };

  const submit = handleSubmit((v) => {
    if (v.transferType === "OnceOff" && !ft.verified) {
      setError("accNum", { message: t("Please verify the account number first") });
      return;
    }
    void ft.submitSameBank(v);
  });

  return (
    <View className="gap-4">
      <TFromAccount ft={ft} control={control} />
      <TBeneficiarySource control={control} />
      {source === "ViaBene" ? (
        <TSavedBeneficiary ft={ft} control={control} />
      ) : (
        <>
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <FormInput control={control} name="accNum" label={t("Account number")} inputType="number" maxLength={16} rules={required("Account number", validators.accountNumber())} />
            </View>
            <View className="w-24 pb-px">
              <BaseButton label={t("Verify")} variant="secondary" onPress={() => void verify()} loading={ft.verifying} />
            </View>
          </View>
          {ft.verified && (
            <View className="flex-row items-center gap-3 rounded-xl bg-secondary-light px-4 py-3">
              <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
              <View>
                <BaseText weight="semibold">{ft.verified["Beneficiary Name"]}</BaseText>
                <BaseText className="text-xs text-muted">
                  {t("Account verified")} · {ft.verified.Currency}
                </BaseText>
              </View>
            </View>
          )}
          <TContactAndSave control={control} />
        </>
      )}
      <TAmountFields control={control} currency={ft.currencyOf(from)} multipleOf100={source === "OnceOff" && ft.needsMultipleOf100(ft.verified?.AccType)} />
      <BaseButton label={t("Continue")} onPress={submit} loading={ft.loading} />
      <BaseButton
        label={t("Clear")}
        variant="ghost"
        onPress={() => {
          reset({ ...EMPTY, fromAccount: ft.accountOptions[0]?.value ?? "" });
          ft.clearVerified();
        }}
      />
    </View>
  );
};

export default TSameBankForm;
