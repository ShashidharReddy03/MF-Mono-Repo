import { View } from "react-native";
import { useForm } from "react-hook-form";
import { validators, type RecoveryUserDetailsForm, t } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import BaseButton from "@/shared/ui/base/BaseButton";

type Props = { onSubmit: (v: RecoveryUserDetailsForm) => Promise<boolean>; onCancel: () => void; loading: boolean };

const RecoveryDetails = ({ onSubmit, onCancel, loading }: Props) => {
  const { control, handleSubmit } = useForm<RecoveryUserDetailsForm>({ defaultValues: { cif: "", email: "" }, mode: "onTouched" });
  return (
    <View className="gap-4">
      <FormInput
        control={control}
        name="cif"
        label={t("Customer ID (CIF)")}
        inputType="number"
        placeholder={t("Printed on your passbook")}
        maxLength={12}
        rules={required("CIF", validators.cif())}
      />
      <FormInput
        control={control}
        name="email"
        label={t("Registered email")}
        inputType="email"
        placeholder="name@example.com"
        maxLength={60}
        rules={required("Email", validators.email())}
      />
      <BaseButton label={t("Continue")} onPress={handleSubmit(onSubmit)} loading={loading} />
      <BaseButton label={t("Back to login")} variant="ghost" onPress={onCancel} />
    </View>
  );
};

export default RecoveryDetails;
