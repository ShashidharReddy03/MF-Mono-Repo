import { useEffect } from "react";
import { View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { t, type FundTransfer, type OwnTransferForm } from "@mf-bank/shared";
import { requiredSelect } from "@/core/utils/rhfRules";
import FormSelect from "@/shared/ui/form/FormSelect";
import BaseButton from "@/shared/ui/base/BaseButton";
import { TAmountFields, TFromAccount } from "./T-CommonFields";

/** Between the customer's own accounts — no OTP (CONFIRM_ONLY) */
const TOwnForm = ({ ft }: { ft: FundTransfer }) => {
  const { control, handleSubmit, setValue, reset, trigger, getValues } = useForm<OwnTransferForm>({
    defaultValues: { fromAccount: ft.accountOptions[0]?.value ?? "", toAccount: "", amount: "", narration: "", ...(ft.draft as Partial<OwnTransferForm>) },
    mode: "onTouched",
  });
  const from = useWatch({ control, name: "fromAccount" });
  const to = useWatch({ control, name: "toAccount" });

  useEffect(() => {
    if (from && from === to) setValue("toAccount", "");
  }, [from, to, setValue]);
  // the multiples-of-100 rule depends on the destination account
  useEffect(() => {
    if (getValues("amount")) void trigger("amount");
  }, [to, trigger, getValues]);

  return (
    <View className="gap-4">
      <TFromAccount ft={ft} control={control} />
      <FormSelect control={control} name="toAccount" label={t("To account")} placeholder={t("Select account")} options={ft.toAccountOptions(from)} rules={requiredSelect("To account")} />
      <TAmountFields control={control} currency={ft.currencyOf(from)} multipleOf100={ft.needsMultipleOf100(ft.accountTypeOf(to))} withPurpose={false} />
      <BaseButton label={t("Continue")} onPress={handleSubmit(ft.submitOwn)} loading={ft.loading} />
      <BaseButton label={t("Clear")} variant="ghost" onPress={() => reset({ fromAccount: ft.accountOptions[0]?.value ?? "", toAccount: "", amount: "", narration: "" })} />
    </View>
  );
};

export default TOwnForm;
