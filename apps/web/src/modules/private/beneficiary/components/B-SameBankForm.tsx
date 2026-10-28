import { Form } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { validators, type SameBankBeneficiaryForm, type VerifiedAccount, t } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import BaseButton from "@/shared/ui/base/BaseButton";
import { required, rule } from "@/core/utils/antdRules";

type Props = {
  verified: VerifiedAccount | null;
  verifying: boolean;
  loading: boolean;
  onVerify: (acc: string) => Promise<unknown>;
  onAccountChange: () => void;
  onSubmit: (v: SameBankBeneficiaryForm) => Promise<boolean>;
};

/** MF Bank → MF Bank: verify the account to fetch the holder's name first */
const BSameBankForm = ({ verified, verifying, loading, onVerify, onAccountChange, onSubmit }: Props) => {
  const [form] = Form.useForm<SameBankBeneficiaryForm>();

  const verify = async () => {
    try {
      const { accNum } = await form.validateFields(["accNum"]);
      await onVerify(accNum);
    } catch {
      /* field error shown inline */
    }
  };

  return (
    <FormWrapper<SameBankBeneficiaryForm>
      form={form}
      onFinish={onSubmit}
      onValuesChange={(changed) => "accNum" in changed && verified && onAccountChange()}
      className="flex flex-col gap-4"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <FormInput
            name="accNum"
            label={t("Account number")}
            inputType="number"
            maxLength={16}
            rules={required("Account number", validators.accountNumber())}
          />
        </div>
        <BaseButton className="mt-[30px]" label={t("Verify")} loading={verifying} onClick={verify} />
      </div>

      {verified && (
        <div className="flex items-center gap-3 rounded-lg bg-secondary-light px-4 py-3 text-sm">
          <CheckCircleFilled className="text-secondary" />
          <div>
            <div className="font-semibold text-primary">{verified["Beneficiary Name"]}</div>
            <div className="text-xs text-muted">{t("Account verified")} · {verified.Currency}</div>
          </div>
        </div>
      )}

      <FormInput name="alias" label={t("Nickname")} inputType="alphanumeric" maxLength={20} rules={required("Nickname")} />
      <FormInput
        name="mobileNumber"
        label={t("Mobile number")}
        inputType="number"
        maxLength={7}
        rules={required("Mobile number", validators.mobile())}
      />
      <FormInput name="email" label={t("Email (optional)")} inputType="email" maxLength={50} rules={[rule(validators.email())]} />

      <BaseButton htmlType="submit" type="primary" block label={t("Continue")} loading={loading} disabled={!verified} />
    </FormWrapper>
  );
};

export default BSameBankForm;
