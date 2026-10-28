import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import { useRegistration, validators, type CustomerVerificationForm, t } from "@mf-bank/shared";
import { ROUTES } from "@/app/routes/routes";
import { required, rule } from "@/core/utils/antdRules";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import FormRadioGroup from "@/shared/ui/form/FormRadioGroup";
import FormCheckbox from "@/shared/ui/form/FormCheckbox";
import BaseButton from "@/shared/ui/base/BaseButton";

const RCustomerVerification = () => {
  const [form] = Form.useForm<CustomerVerificationForm>();
  const navigate = useNavigate();
  const { verifyCustomer, loading } = useRegistration();
  const type = Form.useWatch("registrationType", form) ?? "New";

  return (
    <FormWrapper
      form={form}
      onFinish={verifyCustomer}
      initialValues={{ registrationType: "New", terms: false }}
      className="flex flex-col gap-4"
    >
      <FormRadioGroup
        name="registrationType"
        label={t("I am")}
        block
        options={[
          { get label() { return t("New to online banking"); }, value: "New" },
          { get label() { return t("Moving from old portal"); }, value: "Migration" },
        ]}
      />

      <FormInput
        name="accNum"
        label={t("Account number")}
        inputType="number"
        placeholder={t("10–16 digit account number")}
        maxLength={16}
        rules={required("Account number", validators.accountNumber())}
      />

      {type === "New" ? (
        <>
          <FormInput
            name="mobileNumber"
            label={t("Registered mobile number")}
            inputType="number"
            placeholder={t("7-digit mobile number")}
            maxLength={7}
            rules={required("Mobile number", validators.mobile())}
          />
          <FormInput
            name="email"
            label={t("Registered email")}
            inputType="email"
            placeholder="name@example.com"
            maxLength={60}
            rules={required("Email", validators.email())}
          />
        </>
      ) : (
        <>
          <FormInput
            name="username"
            label={t("Existing username")}
            inputType="username"
            placeholder={t("Your old portal username")}
            maxLength={25}
            rules={required("Username")}
          />
          <FormInput
            name="cif"
            label={t("Customer ID (CIF)")}
            inputType="number"
            placeholder={t("Printed on your passbook")}
            maxLength={12}
            rules={required("CIF", validators.cif())}
          />
        </>
      )}

      <FormCheckbox name="terms" rules={[rule(validators.requiredCheckbox())]}>
        <span className="text-sm">{t("I agree to the Internet Banking terms and privacy policy.")}</span>
      </FormCheckbox>

      <BaseButton htmlType="submit" type="primary" block label={t("Continue")} loading={loading} />
      <BaseButton htmlType="button" type="text" block label={t("Back to login")} onClick={() => navigate(ROUTES.public.login)} />
    </FormWrapper>
  );
};

export default RCustomerVerification;
