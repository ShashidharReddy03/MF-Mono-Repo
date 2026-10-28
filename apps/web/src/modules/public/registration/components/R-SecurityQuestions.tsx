import { Form } from "antd";
import { useRegistration, type SecurityQuestionsForm, t } from "@mf-bank/shared";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import BaseButton from "@/shared/ui/base/BaseButton";
import SecurityQuestionsFields from "@/shared/ui/components/SecurityQuestionsFields";

const RSecurityQuestions = () => {
  const [form] = Form.useForm<SecurityQuestionsForm>();
  const { questionOptions, submitSecurityQuestions, loading } = useRegistration();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-primary">{t("Set security questions")}</h3>
        <p className="text-sm text-muted">
          {t("We'll ask these if you ever forget your username or password. Answers aren't case-sensitive.")}
        </p>
      </div>
      <FormWrapper form={form} onFinish={submitSecurityQuestions} className="flex flex-col gap-5">
        <SecurityQuestionsFields options={questionOptions} />
        <BaseButton htmlType="submit" type="primary" block label={t("Save and continue")} loading={loading} />
      </FormWrapper>
    </div>
  );
};

export default RSecurityQuestions;
