import { validators, type RecoveryQuestion, t } from "@mf-bank/shared";
import { required } from "@/core/utils/antdRules";
import FormWrapper from "@/shared/ui/form/FormWrapper";
import FormInput from "@/shared/ui/form/FormInput";
import BaseButton from "@/shared/ui/base/BaseButton";

type Props = {
  questions: RecoveryQuestion[];
  onSubmit: (answers: Record<string, string>) => Promise<boolean>;
  onBack: () => void;
  loading: boolean;
};

const RecoverySecurity = ({ questions, onSubmit, onBack, loading }: Props) => (
  <FormWrapper<Record<string, string>> onFinish={onSubmit} className="flex flex-col gap-4">
    <p className="text-sm text-muted">{t("Answer the security questions you set up during registration.")}</p>
    {questions.map((q) => (
      <FormInput
        key={q.id}
        name={q.id}
        label={q.question}
        placeholder={t("Your answer")}
        maxLength={50}
        rules={required("Answer", validators.minLength(2))}
      />
    ))}
    <BaseButton htmlType="submit" type="primary" block label={t("Continue")} loading={loading} />
    <BaseButton htmlType="button" type="text" block label={t("Back")} onClick={onBack} />
  </FormWrapper>
);

export default RecoverySecurity;
