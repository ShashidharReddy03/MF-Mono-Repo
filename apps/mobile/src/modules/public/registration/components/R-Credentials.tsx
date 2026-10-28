import { View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { useRegistration, validators, type RegSetMpinForm, type RegSetPasswordForm, t } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import FormPassword from "@/shared/ui/form/FormPassword";
import FormMpin from "@/shared/ui/form/FormMpin";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";
import PasswordChecklist from "@/shared/ui/components/PasswordChecklist";

/**
 * Last registration step. What it creates next to the username comes from
 * packages/shared/src/config/login.config.ts → registrationCredential:
 *   "mpin" (mobile)  → 6-digit MPIN, entered twice
 *   "password"       → password + checklist (same as web)
 */
const RCredentials = () => {
  const { credentialType } = useRegistration();
  return credentialType === "mpin" ? <MpinCredentials /> : <PasswordCredentials />;
};

/** Server-side username availability check on blur (same as the web onBlur rule) */
const useUsernameCheck = (form: {
  getValues: (n: "regUsername") => string;
  getFieldState: (n: "regUsername") => { invalid: boolean };
  setError: (n: "regUsername", e: { type: string; message: string }) => void;
}) => {
  const { checkUsername } = useRegistration();
  return async () => {
    const value = form.getValues("regUsername");
    if (!value || value.length < 6 || form.getFieldState("regUsername").invalid) return true;
    const error = await checkUsername(value);
    if (error) form.setError("regUsername", { type: "server", message: error });
    return !error;
  };
};

const UsernameField = ({ control, onCheck }: { control: never; onCheck: () => void }) => (
  <FormInput
    control={control}
    name="regUsername"
    label={t("Choose a username")}
    inputType="username"
    placeholder={t("6–20 letters or numbers")}
    maxLength={20}
    onEndEditing={onCheck}
    rules={required("Username", validators.username(), validators.minLength(6))}
  />
);

const MpinCredentials = () => {
  const { submitMpinCredentials, loading, mpinLength } = useRegistration();
  const form = useForm<RegSetMpinForm>({ defaultValues: { regUsername: "", mpin: "", confMpin: "" }, mode: "onTouched" });
  const checkAvailability = useUsernameCheck(form);

  const submit = form.handleSubmit(async (v) => {
    if (await checkAvailability()) await submitMpinCredentials(v);
  });

  return (
    <View className="gap-4">
      <UsernameField control={form.control as never} onCheck={() => void checkAvailability()} />
      <FormMpin
        control={form.control}
        name="mpin"
        length={mpinLength}
        label={t("Create a {{n}}-digit MPIN", { n: mpinLength })}
        rules={required("MPIN", validators.mpin(mpinLength))}
      />
      <BaseText className="-mt-2 text-xs text-muted">
        {t("Numbers only. Avoid repeated or sequential digits like 111111 or 123456.")}
      </BaseText>
      <FormMpin
        control={form.control}
        name="confMpin"
        length={mpinLength}
        label={t("Confirm MPIN")}
        rules={required("Confirm MPIN", validators.matchField("mpin", "MPINs do not match"))}
      />
      <BaseButton label={t("Create account")} onPress={submit} loading={loading} />
    </View>
  );
};

const PasswordCredentials = () => {
  const { submitCredentials, loading } = useRegistration();
  const form = useForm<RegSetPasswordForm>({
    defaultValues: { regUsername: "", password: "", confPassword: "" },
    mode: "onTouched",
  });
  const checkAvailability = useUsernameCheck(form);
  const password = useWatch({ control: form.control, name: "password" });

  const submit = form.handleSubmit(async (v) => {
    if (await checkAvailability()) await submitCredentials(v);
  });

  return (
    <View className="gap-4">
      <UsernameField control={form.control as never} onCheck={() => void checkAvailability()} />
      <FormPassword
        control={form.control}
        name="password"
        label={t("Create password")}
        placeholder={t("Create a strong password")}
        rules={required("Password", validators.strongPassword())}
      />
      <PasswordChecklist password={password} />
      <FormPassword
        control={form.control}
        name="confPassword"
        label={t("Confirm password")}
        placeholder={t("Re-enter your password")}
        rules={required("Confirm password", validators.matchField("password"))}
      />
      <BaseButton label={t("Create account")} onPress={submit} loading={loading} />
    </View>
  );
};

export default RCredentials;
