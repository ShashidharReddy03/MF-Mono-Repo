import { ANSWER_FIELDS, validators, type SelectOption, t } from "@mf-bank/shared";
import { required, rule } from "@/core/utils/antdRules";
import FormSelect from "../form/FormSelect";
import FormInput from "../form/FormInput";

/** Four question/answer pairs; answers must be unique (shared validator) */
const SecurityQuestionsFields = ({ options }: { options: SelectOption[][] }) => (
  <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
    {options.map((opts, idx) => {
      const n = idx + 1;
      const answerField = `answer${n}`;
      return (
        <div key={n} className="flex flex-col gap-2 rounded-lg border border-primary/10 p-3">
          <FormSelect
            name={`ques${n}`}
            label={t("Question {{n}}", { n })}
            placeholder={t("Choose a question")}
            options={opts}
            rules={[{ required: true, message: t("Please select a question") }]}
          />
          <FormInput
            name={answerField}
            placeholder={t("Your answer")}
            maxLength={50}
            dependencies={ANSWER_FIELDS.filter((f) => f !== answerField)}
            rules={[
              ...required("Answer", validators.minLength(2)),
              rule(validators.uniqueAmong(answerField, [...ANSWER_FIELDS])),
            ]}
          />
        </div>
      );
    })}
  </div>
);

export default SecurityQuestionsFields;
