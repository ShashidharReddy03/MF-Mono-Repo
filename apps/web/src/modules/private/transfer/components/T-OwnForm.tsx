import { useEffect } from "react";
import { Form } from "antd";
import { t, type FundTransfer, type OwnTransferForm } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormSelect from "@/shared/ui/form/FormSelect";
import BaseButton from "@/shared/ui/base/BaseButton";
import { TAmountFields, TFromAccount } from "./T-CommonFields";

/** Between the customer's own accounts — no OTP (CONFIRM_ONLY) */
const TOwnForm = ({ ft }: { ft: FundTransfer }) => {
  const [form] = Form.useForm<OwnTransferForm>();
  const from = Form.useWatch("fromAccount", form);
  const to = Form.useWatch("toAccount", form);

  // demo: picking the same account in both fields clears "To account"
  useEffect(() => {
    if (from && from === to) form.setFieldValue("toAccount", undefined);
  }, [form, from, to]);

  return (
    <FormWrapper<OwnTransferForm>
      form={form}
      initialValues={{ fromAccount: ft.accountOptions[0]?.value, ...(ft.draft as Partial<OwnTransferForm>) }}
      onFinish={ft.submitOwn}
      className="flex flex-col gap-4"
    >
      <TFromAccount ft={ft} />
      <FormSelect
        name="toAccount"
        label={t("To account")}
        placeholder={t("Select account")}
        options={ft.toAccountOptions(from)}
        rules={[{ required: true, message: t("Please select {{field}}", { field: t("To account") }) }]}
      />
      <TAmountFields
        currency={ft.currencyOf(from)}
        multipleOf100={ft.needsMultipleOf100(ft.accountTypeOf(to))}
        withPurpose={false}
        dependencies={["toAccount"]}
      />
      <div className="mt-2 grid grid-cols-2 gap-3">
        <BaseButton label={t("Clear")} onClick={() => form.resetFields()} />
        <BaseButton type="primary" htmlType="submit" label={t("Continue")} loading={ft.loading} />
      </div>
    </FormWrapper>
  );
};

export default TOwnForm;
