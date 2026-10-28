import { Form } from "antd";
import { PASSWORD_MAX, t, useChangePassword, validators, type ChangePasswordForm } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormPassword from "@/shared/ui/form/FormPassword";
import BaseButton from "@/shared/ui/base/BaseButton";
import PasswordChecklist from "@/shared/ui/components/PasswordChecklist";
import AuthorisedActionPanel from "@/shared/ui/components/AuthorisedActionPanel";
import { required, rule } from "@/core/utils/antdRules";

/** CHANGE_PASSWORD_CONF → OTP → SAVE_CHANGE_PASSWORD; success ends the session */
const PChangePassword = () => {
  const cp = useChangePassword();
  const [form] = Form.useForm<ChangePasswordForm>();
  const password = Form.useWatch("password", form);

  if (cp.action.step !== "idle") {
    return (
      <AuthorisedActionPanel
        action={cp.action}
        submitLabel={t("Change password")}
        doneLabel={t("Log in again")}
        onDone={cp.finish}
      />
    );
  }

  return (
    <FormWrapper<ChangePasswordForm> form={form} onFinish={cp.submit} className="flex max-w-xl flex-col gap-4">
      <FormPassword name="currentPassword" label={t("Current password")} maxLength={PASSWORD_MAX} rules={required("Current password")} />
      <p className="-mt-2 text-xs text-muted">{t("After 3 wrong attempts you will be logged out automatically.")}</p>
      <FormPassword name="password" label={t("New password")} maxLength={PASSWORD_MAX} rules={required("New password", validators.strongPassword())} />
      <PasswordChecklist password={password} />
      <FormPassword
        name="confPassword"
        label={t("Confirm new password")}
        maxLength={PASSWORD_MAX}
        dependencies={["password"]}
        rules={[...required("Confirm new password"), rule(validators.matchField("password"))]}
      />
      <div className="mt-2 grid grid-cols-2 gap-3">
        <BaseButton label={t("Clear")} onClick={() => form.resetFields()} />
        <BaseButton type="primary" htmlType="submit" label={t("Continue")} loading={cp.loading} />
      </div>
    </FormWrapper>
  );
};

export default PChangePassword;
