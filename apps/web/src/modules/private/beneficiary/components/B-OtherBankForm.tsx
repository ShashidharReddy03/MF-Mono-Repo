import { Form } from "antd";
import { validators, type OtherBankBeneficiaryForm, type SelectOption, t } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import FormSelect from "@/shared/ui/form/FormSelect";
import BaseButton from "@/shared/ui/base/BaseButton";
import { required, rule } from "@/core/utils/antdRules";

type Props = {
  bankOptions: SelectOption[];
  loading: boolean;
  onSubmit: (v: OtherBankBeneficiaryForm) => Promise<boolean>;
};

const BOtherBankForm = ({ bankOptions, loading, onSubmit }: Props) => {
  const [form] = Form.useForm<OtherBankBeneficiaryForm>();
  return (
    <FormWrapper<OtherBankBeneficiaryForm> form={form} onFinish={onSubmit} className="flex flex-col gap-4">
      <FormSelect
        name="beneBank"
        label={t("Bank")}
        placeholder={t("Select bank")}
        options={bankOptions}
        rules={[{ required: true, message: t("Please select bank") }]}
      />
      <FormInput
        name="accNum"
        label={t("Account number")}
        inputType="number"
        maxLength={16}
        rules={required("Account number", validators.accountNumber())}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput name="benFirstName" label={t("First name")} inputType="alpha" maxLength={30} rules={required("First name")} />
        <FormInput name="benLastName" label={t("Last name")} inputType="alpha" maxLength={30} rules={required("Last name")} />
      </div>
      <FormInput name="alias" label={t("Nickname")} inputType="alphanumeric" maxLength={20} rules={required("Nickname")} />
      <FormInput
        name="mobileNumber"
        label={t("Mobile number")}
        inputType="number"
        maxLength={7}
        rules={required("Mobile number", validators.mobile())}
      />
      <FormInput name="email" label={t("Email (optional)")} inputType="email" maxLength={50} rules={[rule(validators.email())]} />
      <BaseButton htmlType="submit" type="primary" block label={t("Continue")} loading={loading} />
    </FormWrapper>
  );
};

export default BOtherBankForm;
