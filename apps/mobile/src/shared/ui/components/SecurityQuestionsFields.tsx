import { View } from "react-native";
import type { Control } from "react-hook-form";
import { ANSWER_FIELDS, validators, type SecurityQuestionsForm, type SelectOption, t } from "@mf-bank/shared";
import { required, requiredSelect } from "@/core/utils/rhfRules";
import FormSelect from "../form/FormSelect";
import FormInput from "../form/FormInput";
import BaseCard from "../base/BaseCard";

/** Four question/answer pairs; answers must be unique (shared validator) */
const SecurityQuestionsFields = ({ control, options }: { control: Control<SecurityQuestionsForm>; options: SelectOption[][] }) => (
  <View className="gap-3">
    {options.map((opts, idx) => {
      const n = (idx + 1) as 1 | 2 | 3 | 4;
      const answerField = `answer${n}` as const;
      return (
        <BaseCard key={n} className="gap-3">
          <FormSelect
            control={control}
            name={`ques${n}`}
            label={t("Question {{n}}", { n })}
            placeholder={t("Choose a question")}
            options={opts}
            rules={requiredSelect("Question")}
          />
          <FormInput
            control={control}
            name={answerField}
            placeholder={t("Your answer")}
            maxLength={50}
            rules={required("Answer", validators.minLength(2), validators.uniqueAmong(answerField, [...ANSWER_FIELDS]))}
          />
        </BaseCard>
      );
    })}
  </View>
);

export default SecurityQuestionsFields;
