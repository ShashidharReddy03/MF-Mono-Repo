import { Form } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { SEFT_NOTICE, t, validators, type FundTransfer, type OtherBankTransferForm } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import FormSelect from "@/shared/ui/form/FormSelect";
import FormCheckbox from "@/shared/ui/form/FormCheckbox";
import BaseButton from "@/shared/ui/base/BaseButton";
import { required, rule } from "@/core/utils/antdRules";
import { TAmountFields, TBeneficiarySource, TContactAndSave, TFromAccount, TSavedBeneficiary } from "./T-CommonFields";

/** To another local bank (SEFT) — new or saved beneficiary */
const TOtherBankForm = ({ ft }: { ft: FundTransfer }) => {
  const [form] = Form.useForm<OtherBankTransferForm & { acceptSeft?: boolean }>();
  const from = Form.useWatch("fromAccount", form);
  const source = Form.useWatch("transferType", form);

  return (
    <FormWrapper<OtherBankTransferForm & { acceptSeft?: boolean }>
      form={form}
      initialValues={{ transferType: "OnceOff", fromAccount: ft.accountOptions[0]?.value, ...(ft.draft as Partial<OtherBankTransferForm>) }}
      onValuesChange={(changed) => {
        if ("transferType" in changed) {
          form.resetFields(["accNum", "bene", "beneBank", "benFirstName", "benLastName", "mobileNumber", "email", "saveBene", "alias"]);
        }
      }}
      onFinish={({ acceptSeft: _accepted, ...v }) => void ft.submitOtherBank({ ...v, paymentMode: "SEFT" })}
      className="flex flex-col gap-4"
    >
      <TFromAccount ft={ft} />
      <TBeneficiarySource />
      {source === "ViaBene" ? (
        <TSavedBeneficiary ft={ft} />
      ) : (
        <>
          <FormSelect name="beneBank" label={t("Bank")} placeholder={t("Select bank")} options={ft.bankOptions} rules={[{ required: true, message: t("Please select bank") }]} />
          <FormInput name="accNum" label={t("Account number")} inputType="number" maxLength={16} rules={required("Account number", validators.accountNumber())} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput name="benFirstName" label={t("First name")} inputType="alpha" maxLength={30} rules={required("First name")} />
            <FormInput name="benLastName" label={t("Last name")} inputType="alpha" maxLength={30} rules={required("Last name")} />
          </div>
          <TContactAndSave />
        </>
      )}
      <TAmountFields currency={ft.currencyOf(from)} />

      {/* demo: PaymentModeConfirmModal — SEFT cut-off notice that must be accepted */}
      <div className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/5 p-4">
        <div className="flex items-start gap-2">
          <InfoCircleOutlined className="mt-0.5 text-warning" />
          <div className="text-sm">
            <div className="font-semibold text-primary">{SEFT_NOTICE.title}</div>
            <p className="mt-0.5 text-muted">{SEFT_NOTICE.message}</p>
            <p className="mt-1 text-muted">{SEFT_NOTICE.warning}</p>
          </div>
        </div>
        <FormCheckbox name="acceptSeft" rules={[rule(validators.requiredCheckbox())]}>
          <span className="text-sm text-primary">{t("I have read and accept the terms and conditions")}</span>
        </FormCheckbox>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <BaseButton label={t("Clear")} onClick={() => form.resetFields()} />
        <BaseButton type="primary" htmlType="submit" label={t("Continue")} loading={ft.loading} />
      </div>
    </FormWrapper>
  );
};

export default TOtherBankForm;
