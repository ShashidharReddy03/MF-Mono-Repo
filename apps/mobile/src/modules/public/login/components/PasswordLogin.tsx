import { Pressable, View } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, MOCK_CREDENTIALS, useLogin, validators, type LoginForm, t } from "@mf-bank/shared";
import { env } from "@/core/config/env";
import { required } from "@/core/utils/rhfRules";
import PublicShell from "@/shared/ui/components/PublicShell";
import FormInput from "@/shared/ui/form/FormInput";
import FormPassword from "@/shared/ui/form/FormPassword";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";
import BaseCard from "@/shared/ui/base/BaseCard";
import CaptchaField from "@/shared/ui/components/CaptchaField";
import OtpVerification from "@/shared/ui/components/OtpVerification";
import type { ReactNode } from "react";

const EMPTY: LoginForm = { username: "", password: "", captcha: "" };

/** login.config method "password": username + password + captcha, then OTP (same flow as web) */
const PasswordLogin = ({ footer }: { footer: ReactNode }) => {
  const navigation = useNavigation();
  const loginFlow = useLogin();
  const { control, handleSubmit, setValue, reset } = useForm<LoginForm>({ defaultValues: EMPTY, mode: "onTouched" });

  const onCredentials = handleSubmit(async (values) => {
    const ok = await loginFlow.submitCredentials(values);
    setValue("captcha", "");
    if (!ok) setValue("password", "");
  });

  if (loginFlow.step === "otp") {
    return (
      <PublicShell title={t("Verify it's you")} subtitle="One more step to keep your account safe.">
        <BaseCard className="p-5">
          <OtpVerification
            title={t("Enter OTP")}
            message={loginFlow.otpMessage}
            submitLabel={t("Verify and sign in")}
            loading={loginFlow.loading}
            remainingAttempts={loginFlow.remainingAttempts}
            resendDisabled={loginFlow.resendDisabled}
            onSubmit={loginFlow.verifyOtp}
            onResend={loginFlow.resendOtp}
            onBack={() => {
              reset(EMPTY);
              loginFlow.backToCredentials();
            }}
            backLabel={t("Back to login")}
          />
        </BaseCard>
      </PublicShell>
    );
  }

  return (
    <PublicShell title={t("Welcome back")} subtitle={t("Sign in with your Internet Banking credentials.")} footer={footer}>
      {env.useMock && (
        <View className="mb-4 rounded-xl bg-secondary-light px-3 py-2.5">
          <BaseText className="text-xs text-secondary-dark">
            {t("Demo mode")}: {t("Username")} <BaseText weight="bold" className="text-secondary-dark">{MOCK_CREDENTIALS.username}</BaseText> · {t("Password")}{" "}
            <BaseText weight="bold" className="text-secondary-dark">{MOCK_CREDENTIALS.password}</BaseText> · OTP{" "}
            <BaseText weight="bold" className="text-secondary-dark">{MOCK_CREDENTIALS.otp}</BaseText>
          </BaseText>
        </View>
      )}

      <View className="gap-4">
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
        <View className="gap-2">
          <FormPassword
            control={control}
            name="password"
            label={t("Password")}
            placeholder={t("Enter your password")}
            left={<Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} />}
            rules={required("Password")}
          />
          <View className="flex-row justify-between">
            <Pressable onPress={() => navigation.navigate("ForgotUsername")} hitSlop={8}>
              <BaseText weight="semibold" className="text-xs text-secondary">
                {t("Forgot username?")}
              </BaseText>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("ForgotPassword")} hitSlop={8}>
              <BaseText weight="semibold" className="text-xs text-secondary">
                {t("Forgot password?")}
              </BaseText>
            </Pressable>
          </View>
        </View>

        <CaptchaField
          control={control}
          name="captcha"
          value={loginFlow.captcha.value}
          onRefresh={() => {
            loginFlow.captcha.refresh();
            setValue("captcha", "");
          }}
          validate={loginFlow.captcha.validate}
        />

        {loginFlow.lockedSeconds > 0 && (
          <BaseText className="text-center text-sm text-danger">
            {t("Too many attempts. Please wait {{n}} seconds.", { n: loginFlow.lockedSeconds })}
          </BaseText>
        )}
        <BaseButton label={t("Sign in")} onPress={onCredentials} loading={loginFlow.loading} disabled={loginFlow.lockedSeconds > 0} />
      </View>
    </PublicShell>
  );
};

export default PasswordLogin;
