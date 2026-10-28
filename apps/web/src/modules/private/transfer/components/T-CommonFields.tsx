import { Form } from "antd";
import {
  BENEFICIARY_TYPE_LABEL,
  DEFAULT_COUNTRY_CODE,
  t,
  TRANSFER_TEXT_MAX,
  TRANSFER_TEXT_MIN,
  validators,
  type FundTransfer,
} from "@mf-bank/shared";
import FormInput from "@/shared/ui/form/FormInput";
import FormSelect from "@/shared/ui/form/FormSelect";
import FormCheckbox from "@/shared/ui/form/FormCheckbox";
import FormRadioGroup from "@/shared/ui/form/FormRadioGroup";
import DetailsList from "@/shared/ui/components/DetailsList";
import { required, rule } from "@/core/utils/antdRules";

/** "From account" — every transfer type starts here (demo: FromAccountField) */
export const TFromAccount = ({ ft }: { ft: FundTransfer }) => (
  <FormSelect name="fromAccount" label={t("From account")} placeholder={t("Select account")} options={ft.accountOptions} rules={[{ required: true, message: t("Please select {{field}}", { field: t("From account") }) }]} />
);

/** Amount (+ currency), narration and purpose — same rules as MF-React-SCU */
export const TAmountFields = ({
  currency,
  multipleOf100,
  withPurpose = true,
  dependencies,
}: {
  currency: string;
  multipleOf100?: boolean;
  withPurpose?: boolean;
  dependencies?: string[];
}) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <FormInput
      name="amount"
      label={t("Amount")}
      inputType="amount"
      prefix={<span className="text-muted">{currency}</span>}
      placeholder="0.00"
      dependencies={dependencies}
      extra={multipleOf100 ? t("Shares accounts accept multiples of 100 only.") : undefined}
      rules={required("Amount", validators.amount(), ...(multipleOf100 ? [validators.multipleOf(100)] : []))}
    />
    <FormInput
      name="narration"
      label={t("Narration")}
      inputType="alphanumeric"
      maxLength={TRANSFER_TEXT_MAX}
      rules={required("Narration", validators.minLength(TRANSFER_TEXT_MIN))}
    />
    {withPurpose && (
      <div className="sm:col-span-2">
        <FormInput
          name="purpose"
          label={t("Purpose of transfer")}
          inputType="alphanumeric"
          maxLength={TRANSFER_TEXT_MAX}
          rules={required("Purpose of transfer", validators.minLength(TRANSFER_TEXT_MIN))}
        />
      </div>
    )}
  </div>
);

/** New beneficiary vs. saved beneficiary (demo: TransferType) */
export const TBeneficiarySource = () => (
  <FormRadioGroup
    name="transferType"
    label={t("Beneficiary")}
    options={[
      { label: t("New beneficiary"), value: "OnceOff" },
      { label: t("Saved beneficiary"), value: "ViaBene" },
    ]}
  />
);

/** Saved beneficiary picker + its details */
export const TSavedBeneficiary = ({ ft }: { ft: FundTransfer }) => {
  const id = Form.useWatch<string | undefined>("bene");
  const b = ft.beneficiaryById(id);
  return (
    <div className="flex flex-col gap-3">
      <FormSelect
        name="bene"
        label={t("Beneficiary")}
        placeholder={t("Select beneficiary")}
        options={ft.beneficiaryOptions}
        notFoundContent={t("No saved beneficiaries")}
        rules={[{ required: true, message: t("Please select {{field}}", { field: t("Beneficiary") }) }]}
      />
      {b && (
        <DetailsList
          items={[
            { label: t("Name"), value: b.beneficiaryName },
            { label: t("Account number"), value: b.maskedAcno },
            { label: t("Bank"), value: b.beneficiaryBank || BENEFICIARY_TYPE_LABEL[b.Type] },
          ]}
        />
      )}
    </div>
  );
};

/** Mobile + email + "save as beneficiary" for new beneficiaries */
export const TContactAndSave = () => {
  const save = Form.useWatch<boolean | undefined>("saveBene");
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="mobileNumber"
          label={t("Mobile number")}
          inputType="number"
          maxLength={7}
          prefix={<span className="text-muted">{DEFAULT_COUNTRY_CODE}</span>}
          rules={required("Mobile number", validators.mobile())}
        />
        <FormInput name="email" label={t("Email (optional)")} inputType="email" maxLength={50} rules={[rule(validators.email())]} />
      </div>
      <FormCheckbox name="saveBene">
        <span className="text-sm text-primary">{t("Save as beneficiary for next time")}</span>
      </FormCheckbox>
      {save && <FormInput name="alias" label={t("Nickname")} inputType="alphanumeric" maxLength={20} rules={required("Nickname")} />}
    </div>
  );
};
