import { validators, type RecoveryUserDetailsForm, t } from "@mf-bank/shared";
import { required } from "@/core/utils/antdRules";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import BaseButton from "@/shared/ui/base/BaseButton";

type Props = {
  onSubmit: (v: RecoveryUserDetailsForm) => Promise<boolean>;
  onCancel: () => void;
  loading: boolean;
};

const RecoveryDetails = ({ onSubmit, onCancel, loading }: Props) => (
  <FormWrapper<RecoveryUserDetailsForm> onFinish={onSubmit} className="flex flex-col gap-4">
    <FormInput
      name="cif"
      label={t("Customer ID (CIF)")}
      inputType="number"
      placeholder={t("Printed on your passbook")}
      maxLength={12}
      rules={required("CIF", validators.cif())}
    />
    <FormInput
      name="email"
      label={t("Registered email")}
      inputType="email"
      placeholder="name@example.com"
      maxLength={60}
      rules={required("Email", validators.email())}
    />
    <BaseButton htmlType="submit" type="primary" block label={t("Continue")} loading={loading} />
    <BaseButton htmlType="button" type="text" block label={t("Back to login")} onClick={onCancel} />
  </FormWrapper>
);

export default RecoveryDetails;
