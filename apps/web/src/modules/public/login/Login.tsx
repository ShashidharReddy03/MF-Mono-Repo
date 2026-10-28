import { useState } from "react";
import { Form } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PASSWORD_MAX, useLogin, useAppDispatch, resetRegistration, validators, type LoginForm, MOCK_CREDENTIALS, t } from "@mf-bank/shared";
import { ROUTES } from "@/app/routes/routes";
import { required } from "@/core/utils/antdRules";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import FormPassword from "@/shared/ui/form/FormPassword";
import BaseButton from "@/shared/ui/base/BaseButton";
import CaptchaField from "@/shared/ui/components/CaptchaField";
import VirtualKeyboard from "@/shared/ui/components/VirtualKeyboard";
import OtpVerification from "@/shared/ui/components/OtpVerification";

const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const Login = () => {
  const [form] = Form.useForm<LoginForm>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showKeyboard, setShowKeyboard] = useState(false);
  const password = Form.useWatch("password", form) ?? "";
  const loginFlow = useLogin();

  const onCredentials = async (values: LoginForm) => {
    const ok = await loginFlow.submitCredentials(values);
    form.setFieldsValue({ captcha: "" });
    if (!ok) form.setFieldsValue({ password: "" });
  };

  const onOtp = async (otp: string) => {
    const ok = await loginFlow.verifyOtp(otp);
    if (ok) navigate(ROUTES.private.dashboard, { replace: true });
    return ok;
  };

  if (loginFlow.step === "otp") {
    return (
      <OtpVerification
        title={t("Verify it's you")}
        message={loginFlow.otpMessage}
        submitLabel={t("Verify and sign in")}
        loading={loginFlow.loading}
        remainingAttempts={loginFlow.remainingAttempts}
        resendDisabled={loginFlow.resendDisabled}
        onSubmit={onOtp}
        onResend={loginFlow.resendOtp}
        onBack={() => {
          form.resetFields();
          loginFlow.backToCredentials();
        }}
        backLabel={t("Back to login")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-primary">{t("Sign in")}</h2>
        <p className="mt-1 text-sm text-muted">{t("Use your Internet Banking username and password.")}</p>
      </div>

      {IS_MOCK && (
        <div className="rounded-lg bg-secondary-light px-3 py-2 text-xs text-secondary-dark">
          {t("Demo mode")}: {t("Username")} <b dir="ltr">{MOCK_CREDENTIALS.username}</b> · {t("Password")}{" "}
          <b dir="ltr">{MOCK_CREDENTIALS.password}</b> · OTP <b dir="ltr">{MOCK_CREDENTIALS.otp}</b>
        </div>
      )}

      <FormWrapper form={form} onFinish={onCredentials} className="flex flex-col gap-4">
        <FormInput
          name="username"
          label={t("Username")}
          inputType="username"
          placeholder={t("Enter your username")}
          prefix={<UserOutlined className="text-muted" />}
          maxLength={25}
          rules={required("Username", validators.username())}
        />
        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <FormPassword
                name="password"
                label={t("Password")}
                placeholder={t("Enter your password")}
                prefix={<LockOutlined className="text-muted" />}
                autoComplete="current-password"
                rules={required("Password")}
              />
            </div>
            <BaseButton
              htmlType="button"
              label="⌨"
              aria-label={t("Open virtual keyboard")}
              title={t("Virtual keyboard")}
              onClick={() => setShowKeyboard(true)}
              className="mb-0 !px-3"
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-semibold">
            <button type="button" className="text-secondary hover:underline" onClick={() => navigate(ROUTES.public.forgotUsername)}>
              {t("Forgot username?")}
            </button>
            <button type="button" className="text-secondary hover:underline" onClick={() => navigate(ROUTES.public.forgotPassword)}>
              {t("Forgot password?")}
            </button>
          </div>
        </div>

        <CaptchaField
          value={loginFlow.captcha.value}
          onRefresh={() => {
            loginFlow.captcha.refresh();
            form.setFieldsValue({ captcha: "" });
          }}
          validate={loginFlow.captcha.validate}
        />

        {loginFlow.lockedSeconds > 0 && (
          <p className="text-center text-sm text-danger" role="alert">
            {t("Too many attempts. Please wait {{n}} seconds.", { n: loginFlow.lockedSeconds })}
          </p>
        )}
        <BaseButton htmlType="submit" type="primary" block label={t("Sign in")} loading={loginFlow.loading} disabled={loginFlow.lockedSeconds > 0} className="mt-2" />
      </FormWrapper>

      <p className="text-center text-sm text-muted">
        New to Internet Banking?{" "}
        <button
          type="button"
          className="font-semibold text-secondary hover:underline"
          onClick={() => {
            dispatch(resetRegistration());
            navigate(ROUTES.public.registration);
          }}
        >
          {t("Register now")}
        </button>
      </p>

      <VirtualKeyboard
        open={showKeyboard}
        value={password}
        maxLength={PASSWORD_MAX}
        onClose={() => setShowKeyboard(false)}
        onChange={(v) => form.setFieldValue("password", v)}
      />
    </div>
  );
};

export default Login;
