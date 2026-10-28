import { Form } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { t, validators, type FundTransfer, type SameBankTransferForm } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import BaseButton from "@/shared/ui/base/BaseButton";
import { required } from "@/core/utils/antdRules";
import { TAmountFields, TBeneficiarySource, TContactAndSave, TFromAccount, TSavedBeneficiary } from "./T-CommonFields";

/** To another MF Bank account — new (verified) or saved beneficiary */
const TSameBankForm = ({ ft }: { ft: FundTransfer }) => {
  const [form] = Form.useForm<SameBankTransferForm>();
  const from = Form.useWatch("fromAccount", form);
  const source = Form.useWatch("transferType", form);

  const verify = async () => {
    try {
      const { accNum } = await form.validateFields(["accNum"]);
      await ft.verifyAccount(accNum ?? "");
    } catch {
      /* error shown on the field */
    }
  };

  return (
    <FormWrapper<SameBankTransferForm>
      form={form}
      initialValues={{ transferType: "OnceOff", fromAccount: ft.accountOptions[0]?.value, ...(ft.draft as Partial<SameBankTransferForm>) }}
      onValuesChange={(changed) => {
        if ("accNum" in changed && ft.verified) ft.clearVerified();
        // demo: switching new/saved clears the beneficiary-specific fields
        if ("transferType" in changed) form.resetFields(["accNum", "bene", "mobileNumber", "email", "saveBene", "alias"]);
      }}
      onFinish={(v) => {
        if (v.transferType === "OnceOff" && !ft.verified) {
          form.setFields([{ name: "accNum", errors: [t("Please verify the account number first")] }]);
          return;
        }
        void ft.submitSameBank(v);
      }}
      className="flex flex-col gap-4"
    >
      <TFromAccount ft={ft} />
      <TBeneficiarySource />
      {source === "ViaBene" ? (
        <TSavedBeneficiary ft={ft} />
      ) : (
        <>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <FormInput name="accNum" label={t("Account number")} inputType="number" maxLength={16} rules={required("Account number", validators.accountNumber())} />
            </div>
            <BaseButton className="mt-[30px]" label={t("Verify")} loading={ft.verifying} onClick={() => void verify()} />
          </div>
          {ft.verified && (
            <div className="flex items-center gap-3 rounded-lg bg-secondary-light px-4 py-3 text-sm">
              <CheckCircleFilled className="text-secondary" />
              <div>
                <div className="font-semibold text-primary">{ft.verified["Beneficiary Name"]}</div>
                <div className="text-xs text-muted">{t("Account verified")} · {ft.verified.Currency}</div>
              </div>
            </div>
          )}
          <TContactAndSave />
        </>
      )}
      <TAmountFields currency={ft.currencyOf(from)} multipleOf100={source === "OnceOff" && ft.needsMultipleOf100(ft.verified?.AccType)} />
      <div className="mt-2 grid grid-cols-2 gap-3">
        <BaseButton label={t("Clear")} onClick={() => { form.resetFields(); ft.clearVerified(); }} />
        <BaseButton type="primary" htmlType="submit" label={t("Continue")} loading={ft.loading} />
      </div>
    </FormWrapper>
  );
};

export default TSameBankForm;
