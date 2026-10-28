import { View } from "react-native";
import { useForm } from "react-hook-form";
import { useRegistration, type SecurityQuestionsForm, t } from "@mf-bank/shared";
import SecurityQuestionsFields from "@/shared/ui/components/SecurityQuestionsFields";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";

const RSecurityQuestions = () => {
  const { questionOptions, submitSecurityQuestions, loading } = useRegistration();
  const { control, handleSubmit } = useForm<SecurityQuestionsForm>({ mode: "onTouched" });

  return (
    <View className="gap-4">
      <BaseText className="text-sm text-muted">
        {t("Choose four questions and answers. You'll use them to recover your username or password.")}
      </BaseText>
      <SecurityQuestionsFields control={control} options={questionOptions} />
      <BaseButton label={t("Continue")} onPress={handleSubmit(submitSecurityQuestions)} loading={loading} />
    </View>
  );
};

export default RSecurityQuestions;
