import { View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { t, useChangePassword, validators, type ChangePasswordForm } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import Screen from "@/shared/ui/components/Screen";
import FormPassword from "@/shared/ui/form/FormPassword";
import PasswordChecklist from "@/shared/ui/components/PasswordChecklist";
import AuthorisedActionPanel from "@/shared/ui/components/AuthorisedActionPanel";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseCard from "@/shared/ui/base/BaseCard";
import BaseText from "@/shared/ui/base/BaseText";

/** CHANGE_PASSWORD_CONF → OTP → SAVE_CHANGE_PASSWORD; success ends the session */
const ChangePasswordScreen = () => {
  const cp = useChangePassword();
  const { control, handleSubmit } = useForm<ChangePasswordForm>({
    defaultValues: { currentPassword: "", password: "", confPassword: "" },
    mode: "onTouched",
  });
  const password = useWatch({ control, name: "password" });

  return (
    <Screen edges={["bottom"]}>
      <BaseCard className="p-5">
        {cp.action.step !== "idle" ? (
          <AuthorisedActionPanel action={cp.action} submitLabel={t("Change password")} doneLabel={t("Log in again")} onDone={cp.finish} />
        ) : (
          <View className="gap-4">
            <FormPassword control={control} name="currentPassword" label={t("Current password")} rules={required("Current password")} />
            <BaseText className="-mt-2 text-xs text-muted">{t("After 3 wrong attempts you will be logged out automatically.")}</BaseText>
            <FormPassword control={control} name="password" label={t("New password")} rules={required("New password", validators.strongPassword())} />
            <PasswordChecklist password={password} />
            <FormPassword control={control} name="confPassword" label={t("Confirm new password")} rules={required("Confirm new password", validators.matchField("password"))} />
            <BaseButton label={t("Continue")} onPress={handleSubmit(cp.submit)} loading={cp.loading} />
          </View>
        )}
      </BaseCard>
    </Screen>
  );
};

export default ChangePasswordScreen;
