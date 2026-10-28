import { View } from "react-native";
import { useForm } from "react-hook-form";
import { validators, type OtherBankBeneficiaryForm, type SelectOption, t } from "@mf-bank/shared";
import { required, requiredSelect, rule } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import FormSelect from "@/shared/ui/form/FormSelect";
import BaseButton from "@/shared/ui/base/BaseButton";

type Props = { bankOptions: SelectOption[]; loading: boolean; onSubmit: (v: OtherBankBeneficiaryForm) => Promise<boolean> };

const BOtherBankForm = ({ bankOptions, loading, onSubmit }: Props) => {
  const { control, handleSubmit } = useForm<OtherBankBeneficiaryForm>({
    defaultValues: { accNum: "", beneBank: "", benFirstName: "", benLastName: "", alias: "", mobileNumber: "", email: "" },
    mode: "onTouched",
  });
  return (
    <View className="gap-4">
      <FormSelect control={control} name="beneBank" label={t("Bank")} placeholder={t("Select bank")} options={bankOptions} rules={requiredSelect("Bank")} />
      <FormInput
        control={control}
        name="accNum"
        label={t("Account number")}
        inputType="number"
        maxLength={16}
        rules={required("Account number", validators.accountNumber())}
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormInput control={control} name="benFirstName" label={t("First name")} inputType="alpha" maxLength={30} rules={required("First name")} />
        </View>
        <View className="flex-1">
          <FormInput control={control} name="benLastName" label={t("Last name")} inputType="alpha" maxLength={30} rules={required("Last name")} />
        </View>
      </View>
      <FormInput control={control} name="alias" label={t("Nickname")} inputType="alphanumeric" maxLength={20} rules={required("Nickname")} />
      <FormInput
        control={control}
        name="mobileNumber"
        label={t("Mobile number")}
        inputType="number"
        maxLength={7}
        rules={required("Mobile number", validators.mobile())}
      />
      <FormInput control={control} name="email" label={t("Email (optional)")} inputType="email" maxLength={50} rules={rule(validators.email())} />
      <BaseButton label={t("Continue")} onPress={handleSubmit(onSubmit)} loading={loading} />
    </View>
  );
};

export default BOtherBankForm;
