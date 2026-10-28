import { Form } from "antd";
import { validators, t } from "@mf-bank/shared";
import { required } from "@/core/utils/antdRules";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormPassword from "@/shared/ui/form/FormPassword";
import BaseButton from "@/shared/ui/base/BaseButton";
import PasswordChecklist from "@/shared/ui/components/PasswordChecklist";

type Values = { password: string; confPassword: string };
type Props = { onSubmit: (password: string, confirm: string) => Promise<boolean>; loading: boolean };

const RecoveryNewPassword = ({ onSubmit, loading }: Props) => {
  const [form] = Form.useForm<Values>();
  const password = Form.useWatch("password", form);

  return (
    <FormWrapper form={form} onFinish={(v) => onSubmit(v.password, v.confPassword)} className="flex flex-col gap-4">
      <FormPassword
        name="password"
        label={t("New password")}
        placeholder={t("Create a strong password")}
        rules={required("Password", validators.strongPassword())}
      />
      <PasswordChecklist password={password} />
      <FormPassword
        name="confPassword"
        label={t("Confirm new password")}
        placeholder={t("Re-enter your password")}
        dependencies={["password"]}
        rules={required("Confirm password", validators.matchField("password"))}
      />
      <BaseButton htmlType="submit" type="primary" block label={t("Reset password")} loading={loading} />
    </FormWrapper>
  );
};

export default RecoveryNewPassword;
