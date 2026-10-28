import { View } from "react-native";
import { useForm } from "react-hook-form";
import { validators, type RecoveryQuestion, t } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";

type Props = {
  questions: RecoveryQuestion[];
  onSubmit: (answers: Record<string, string>) => Promise<boolean>;
  onBack: () => void;
  loading: boolean;
};

const RecoverySecurity = ({ questions, onSubmit, onBack, loading }: Props) => {
  const { control, handleSubmit } = useForm<Record<string, string>>({ mode: "onTouched" });
  return (
    <View className="gap-4">
      <BaseText className="text-sm text-muted">{t("Answer the security questions you set up during registration.")}</BaseText>
      {questions.map((q) => (
        <FormInput
          key={q.id}
          control={control}
          name={q.id}
          label={q.question}
          placeholder={t("Your answer")}
          maxLength={50}
          rules={required("Answer", validators.minLength(2))}
        />
      ))}
      <BaseButton label={t("Continue")} onPress={handleSubmit(onSubmit)} loading={loading} />
      <BaseButton label={t("Back")} variant="ghost" onPress={onBack} />
    </View>
  );
};

export default RecoverySecurity;
