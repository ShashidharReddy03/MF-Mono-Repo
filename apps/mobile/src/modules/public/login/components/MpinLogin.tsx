import { Pressable, View } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, MOCK_CREDENTIALS, useMpinLogin, validators, type MpinLoginForm, t } from "@mf-bank/shared";
import { env } from "@/core/config/env";
import { required } from "@/core/utils/rhfRules";
import PublicShell from "@/shared/ui/components/PublicShell";
import FormInput from "@/shared/ui/form/FormInput";
import FormMpin from "@/shared/ui/form/FormMpin";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";
import type { ReactNode } from "react";

const EMPTY: MpinLoginForm = { username: "", mpin: "" };

/** login.config method "mpin": username + MPIN (numbers only). No password, captcha or OTP. */
const MpinLogin = ({ footer }: { footer: ReactNode }) => {
  const navigation = useNavigation();
  const flow = useMpinLogin();
  const { control, handleSubmit, setValue } = useForm<MpinLoginForm>({ defaultValues: EMPTY, mode: "onTouched" });

  const onSubmit = handleSubmit(async (values) => {
    const ok = await flow.submit(values);
    if (!ok) setValue("mpin", "");
  });

  return (
    <PublicShell title={t("Welcome back")} subtitle={t("Sign in with your username and MPIN.")} footer={footer}>
      {env.useMock && (
        <View className="mb-4 rounded-xl bg-secondary-light px-3 py-2.5">
          <BaseText className="text-xs text-secondary-dark">
            {t("Demo mode")}: {t("Username")} <BaseText weight="bold" className="text-secondary-dark">{MOCK_CREDENTIALS.username}</BaseText> · {t("MPIN")}{" "}
            <BaseText weight="bold" className="text-secondary-dark">{MOCK_CREDENTIALS.mpin}</BaseText>
          </BaseText>
        </View>
      )}

      <View className="gap-4">
        <View className="gap-2">
          <FormInput
            control={control}
            name="username"
            label={t("Username")}
            inputType="username"
            placeholder={t("Enter your username")}
            maxLength={25}
            left={<Ionicons name="person-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} />}
            rules={required("Username", validators.username())}
          />
          <Pressable onPress={() => navigation.navigate("ForgotUsername")} hitSlop={8} className="self-start">
            <BaseText weight="semibold" className="text-xs text-secondary">
              {t("Forgot username?")}
            </BaseText>
          </Pressable>
        </View>

        <FormMpin control={control} name="mpin" length={flow.length} label={t("{{n}}-digit MPIN", { n: flow.length })} />

        {flow.lockedSeconds > 0 && (
          <BaseText className="text-center text-sm text-danger">
            {t("Too many attempts. Please wait {{n}} seconds.", { n: flow.lockedSeconds })}
          </BaseText>
        )}
        <BaseButton label={t("Sign in")} onPress={onSubmit} loading={flow.loading} disabled={flow.lockedSeconds > 0} />
      </View>
    </PublicShell>
  );
};

export default MpinLogin;
