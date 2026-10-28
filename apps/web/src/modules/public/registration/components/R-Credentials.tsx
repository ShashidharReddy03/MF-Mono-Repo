import { Form } from "antd";
import { useRegistration, validators, type RegSetPasswordForm, t } from "@mf-bank/shared";
import { required } from "@/core/utils/antdRules";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import FormPassword from "@/shared/ui/form/FormPassword";
import BaseButton from "@/shared/ui/base/BaseButton";
import PasswordChecklist from "@/shared/ui/components/PasswordChecklist";

const RCredentials = () => {
  const [form] = Form.useForm<RegSetPasswordForm>();
  const { submitCredentials, checkUsername, loading } = useRegistration();
  const password = Form.useWatch("password", form);

  return (
    <FormWrapper form={form} onFinish={submitCredentials} className="flex flex-col gap-4">
      <FormInput
        name="regUsername"
        label={t("Choose a username")}
        inputType="username"
        placeholder={t("6–20 letters or numbers")}
        maxLength={20}
        validateTrigger={["onChange", "onBlur"]}
        rules={[
          ...required("Username", validators.username(), validators.minLength(6)),
          {
            validateTrigger: "onBlur",
            validator: async (_, value: string) => {
              if (!value || value.length < 6) return;
              const error = await checkUsername(value);
              if (error) throw new Error(error);
            },
          },
        ]}
      />
      <FormPassword
        name="password"
        label={t("Create password")}
        placeholder={t("Create a strong password")}
        rules={required("Password", validators.strongPassword())}
      />
      <PasswordChecklist password={password} />
      <FormPassword
        name="confPassword"
        label={t("Confirm password")}
        placeholder={t("Re-enter your password")}
        dependencies={["password"]}
        rules={required("Confirm password", validators.matchField("password"))}
      />
      <BaseButton htmlType="submit" type="primary" block label={t("Create account")} loading={loading} />
    </FormWrapper>
  );
};

export default RCredentials;
