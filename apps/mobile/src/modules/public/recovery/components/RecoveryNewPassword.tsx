import { View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { validators, t } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import FormPassword from "@/shared/ui/form/FormPassword";
import BaseButton from "@/shared/ui/base/BaseButton";
import PasswordChecklist from "@/shared/ui/components/PasswordChecklist";

type Values = { password: string; confPassword: string };
type Props = { onSubmit: (password: string, confirm: string) => Promise<boolean>; loading: boolean };

const RecoveryNewPassword = ({ onSubmit, loading }: Props) => {
  const { control, handleSubmit } = useForm<Values>({ defaultValues: { password: "", confPassword: "" }, mode: "onTouched" });
  const password = useWatch({ control, name: "password" });
  return (
    <View className="gap-4">
      <FormPassword
        control={control}
        name="password"
        label={t("New password")}
        placeholder={t("Create a strong password")}
        rules={required("Password", validators.strongPassword())}
      />
      <PasswordChecklist password={password} />
      <FormPassword
        control={control}
        name="confPassword"
        label={t("Confirm new password")}
        placeholder={t("Re-enter your password")}
        rules={required("Confirm password", validators.matchField("password"))}
      />
      <BaseButton label={t("Reset password")} onPress={handleSubmit((v) => onSubmit(v.password, v.confPassword))} loading={loading} />
    </View>
  );
};

export default RecoveryNewPassword;
