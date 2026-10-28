import { useEffect } from "react";
import { View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { t, validators, type FundTransfer, type OtherBankTransferForm } from "@mf-bank/shared";
import { required, requiredSelect } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import FormSelect from "@/shared/ui/form/FormSelect";
import BaseButton from "@/shared/ui/base/BaseButton";
import { TAmountFields, TBeneficiarySource, TContactAndSave, TFromAccount, TSavedBeneficiary, TSeftNotice } from "./T-CommonFields";

type Values = OtherBankTransferForm & { acceptSeft?: boolean };
const EMPTY: Values = {
  transferType: "OnceOff", fromAccount: "", amount: "", narration: "", purpose: "", accNum: "", bene: "", beneBank: "",
  benFirstName: "", benLastName: "", mobileNumber: "", email: "", saveBene: false, alias: "", acceptSeft: false,
};

/** To another local bank (SEFT) — new or saved beneficiary */
const TOtherBankForm = ({ ft }: { ft: FundTransfer }) => {
  const { control, handleSubmit, reset, resetField } = useForm<Values>({
    defaultValues: { ...EMPTY, fromAccount: ft.accountOptions[0]?.value ?? "", ...(ft.draft as Partial<Values>) },
    mode: "onTouched",
    shouldUnregister: true,
  });
  const from = useWatch({ control, name: "fromAccount" });
  const source = useWatch({ control, name: "transferType" });

  useEffect(() => {
    (["accNum", "bene", "beneBank", "benFirstName", "benLastName", "mobileNumber", "email", "saveBene", "alias"] as const).forEach((f) => resetField(f));
  }, [source, resetField]);

  return (
    <View className="gap-4">
      <TFromAccount ft={ft} control={control} />
      <TBeneficiarySource control={control} />
      {source === "ViaBene" ? (
        <TSavedBeneficiary ft={ft} control={control} />
      ) : (
        <>
          <FormSelect control={control} name="beneBank" label={t("Bank")} placeholder={t("Select bank")} options={ft.bankOptions} rules={requiredSelect("Bank")} />
          <FormInput control={control} name="accNum" label={t("Account number")} inputType="number" maxLength={16} rules={required("Account number", validators.accountNumber())} />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FormInput control={control} name="benFirstName" label={t("First name")} inputType="alpha" maxLength={30} rules={required("First name")} />
            </View>
            <View className="flex-1">
              <FormInput control={control} name="benLastName" label={t("Last name")} inputType="alpha" maxLength={30} rules={required("Last name")} />
            </View>
          </View>
          <TContactAndSave control={control} />
        </>
      )}
      <TAmountFields control={control} currency={ft.currencyOf(from)} />
      <TSeftNotice control={control} />
      <BaseButton label={t("Continue")} onPress={handleSubmit(({ acceptSeft: _a, ...v }) => void ft.submitOtherBank({ ...v, paymentMode: "SEFT" }))} loading={ft.loading} />
      <BaseButton label={t("Clear")} variant="ghost" onPress={() => reset({ ...EMPTY, fromAccount: ft.accountOptions[0]?.value ?? "" })} />
    </View>
  );
};

export default TOtherBankForm;
