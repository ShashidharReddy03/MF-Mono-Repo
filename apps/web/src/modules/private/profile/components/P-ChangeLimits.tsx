import { Form } from "antd";
import { formatAmount, t, useChangeLimits, validators, type ChangeLimitsForm } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import FormSwitch from "@/shared/ui/form/FormSwitch";
import BaseButton from "@/shared/ui/base/BaseButton";
import AuthorisedActionPanel from "@/shared/ui/components/AuthorisedActionPanel";
import { required } from "@/core/utils/antdRules";

/** CHANGE_LIMITS_CONF → OTP → CHANGE_LIMITS_FINAL */
const PChangeLimits = () => {
  const cl = useChangeLimits();
  const [form] = Form.useForm<ChangeLimitsForm>();
  const off = Form.useWatch("serviceOff", form);

  if (cl.action.step !== "idle") {
    return (
      <AuthorisedActionPanel action={cl.action} submitLabel={t("Update limit")} doneLabel={t("Done")} onDone={cl.action.reset} />
    );
  }

  return (
    <FormWrapper<ChangeLimitsForm> form={form} initialValues={cl.initialValues} onFinish={cl.submit} className="flex max-w-xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface px-4 py-3">
          <div className="text-xs text-muted">{t("Current limit")}</div>
          <div dir="ltr" className="text-start font-semibold text-primary rtl:text-end">{cl.currency} {formatAmount(cl.serviceOff ? 0 : cl.currentLimit)}</div>
        </div>
        <div className="rounded-xl bg-surface px-4 py-3">
          <div className="text-xs text-muted">{t("Maximum allowed")}</div>
          <div dir="ltr" className="text-start font-semibold text-primary rtl:text-end">{cl.currency} {formatAmount(cl.maxLimit)}</div>
        </div>
      </div>
      <FormSwitch
        name="serviceOff"
        label={t("Turn off transfers to others")}
        onChange={(checked) => form.setFieldValue("amount", cl.amountForToggle(checked))}
      />
      <FormInput
        name="amount"
        label={t("New daily limit")}
        inputType="amount"
        disabled={off}
        prefix={<span className="text-muted">{cl.currency}</span>}
        rules={off ? [] : required("New daily limit", validators.amount(), validators.maxAmount(cl.maxLimit))}
      />
      <BaseButton type="primary" htmlType="submit" label={t("Continue")} loading={cl.loading} className="mt-2" />
    </FormWrapper>
  );
};

export default PChangeLimits;
