import { Form } from "antd";
import { t, useResetSecurityQuestions, type SecurityQuestionsForm } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import BaseButton from "@/shared/ui/base/BaseButton";
import SecurityQuestionsFields from "@/shared/ui/components/SecurityQuestionsFields";
import AuthorisedActionPanel from "@/shared/ui/components/AuthorisedActionPanel";

/** CHANGE_SECQUESTIONS_CONF → OTP → CHANGE_SECQUESTIONS_FINAL (same fields as registration) */
const PSecurityQuestions = () => {
  const sq = useResetSecurityQuestions();
  const [form] = Form.useForm<SecurityQuestionsForm>();

  if (sq.action.step !== "idle") {
    return <AuthorisedActionPanel action={sq.action} submitLabel={t("Save questions")} doneLabel={t("Done")} onDone={sq.action.reset} />;
  }

  return (
    <FormWrapper<SecurityQuestionsForm> form={form} onFinish={sq.submit} className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t("Choose four questions and answers. You'll use them to recover your username or password.")}</p>
      <SecurityQuestionsFields options={sq.questionOptions} />
      <div className="mt-2 grid grid-cols-2 gap-3 sm:max-w-md">
        <BaseButton label={t("Clear")} onClick={() => form.resetFields()} />
        <BaseButton type="primary" htmlType="submit" label={t("Continue")} loading={sq.loading} />
      </div>
    </FormWrapper>
  );
};

export default PSecurityQuestions;
