import { View } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { t, useResetSecurityQuestions, type SecurityQuestionsForm } from "@mf-bank/shared";
import Screen from "@/shared/ui/components/Screen";
import SecurityQuestionsFields from "@/shared/ui/components/SecurityQuestionsFields";
import AuthorisedActionPanel from "@/shared/ui/components/AuthorisedActionPanel";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseCard from "@/shared/ui/base/BaseCard";
import BaseText from "@/shared/ui/base/BaseText";

/** CHANGE_SECQUESTIONS_CONF → OTP → CHANGE_SECQUESTIONS_FINAL (same fields as registration) */
const SecurityQuestionsScreen = () => {
  const navigation = useNavigation();
  const sq = useResetSecurityQuestions();
  const { control, handleSubmit } = useForm<SecurityQuestionsForm>({ mode: "onTouched" });

  if (sq.action.step !== "idle") {
    return (
      <Screen edges={["bottom"]}>
        <BaseCard className="p-5">
          <AuthorisedActionPanel action={sq.action} submitLabel={t("Save questions")} doneLabel={t("Done")} onDone={() => navigation.goBack()} />
        </BaseCard>
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <View className="gap-4">
        <BaseText className="text-sm text-muted">{t("Choose four questions and answers. You'll use them to recover your username or password.")}</BaseText>
        <SecurityQuestionsFields control={control} options={sq.questionOptions} />
        <BaseButton label={t("Continue")} onPress={handleSubmit(sq.submit)} loading={sq.loading} />
      </View>
    </Screen>
  );
};

export default SecurityQuestionsScreen;
