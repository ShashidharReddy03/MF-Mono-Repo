import { View } from "react-native";
import { useForm } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { colors, validators, type SameBankBeneficiaryForm, type VerifiedAccount, t } from "@mf-bank/shared";
import { required, rule } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";

type Props = {
  verified: VerifiedAccount | null;
  verifying: boolean;
  loading: boolean;
  onVerify: (acc: string) => Promise<unknown>;
  onAccountChange: () => void;
  onSubmit: (v: SameBankBeneficiaryForm) => Promise<boolean>;
};

/** MF Bank → MF Bank: verify the account to fetch the holder's name first */
const BSameBankForm = ({ verified, verifying, loading, onVerify, onAccountChange, onSubmit }: Props) => {
  const { control, handleSubmit, trigger, getValues } = useForm<SameBankBeneficiaryForm>({
    defaultValues: { accNum: "", beneName: "", alias: "", mobileNumber: "", email: "" },
    mode: "onTouched",
  });

  const verify = async () => {
    if (await trigger("accNum")) await onVerify(getValues("accNum"));
  };

  return (
    <View className="gap-4">
      <View className="flex-row items-end gap-2">
        <View className="flex-1">
          <FormInput
            control={control}
            name="accNum"
            label={t("Account number")}
            inputType="number"
            maxLength={16}
            onChange={() => verified && onAccountChange()}
            rules={required("Account number", validators.accountNumber())}
          />
        </View>
        <View className="w-24 pb-px">
          <BaseButton label={t("Verify")} variant="secondary" onPress={verify} loading={verifying} />
        </View>
      </View>

      {verified && (
        <View className="flex-row items-center gap-3 rounded-xl bg-secondary-light px-4 py-3">
          <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
          <View>
            <BaseText weight="semibold">{verified["Beneficiary Name"]}</BaseText>
            <BaseText className="text-xs text-muted">{t("Account verified")} · {verified.Currency}</BaseText>
          </View>
        </View>
      )}

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
      <BaseButton label={t("Continue")} onPress={handleSubmit(onSubmit)} loading={loading} disabled={!verified} />
    </View>
  );
};

export default BSameBankForm;
