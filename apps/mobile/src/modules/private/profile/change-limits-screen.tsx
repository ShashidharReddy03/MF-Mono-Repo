import { View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { formatAmount, t, useChangeLimits, validators, type ChangeLimitsForm } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import Screen from "@/shared/ui/components/Screen";
import FormInput from "@/shared/ui/form/FormInput";
import FormSwitch from "@/shared/ui/form/FormSwitch";
import AuthorisedActionPanel from "@/shared/ui/components/AuthorisedActionPanel";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseCard from "@/shared/ui/base/BaseCard";
import BaseText from "@/shared/ui/base/BaseText";

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 rounded-xl bg-surface px-3 py-2.5">
    <BaseText className="text-2xs text-muted">{label}</BaseText>
    <BaseText weight="semibold" className="mt-0.5 text-sm" numberOfLines={1} adjustsFontSizeToFit>
      {"‎"}
      {value}
    </BaseText>
  </View>
);

/** CHANGE_LIMITS_CONF → OTP → CHANGE_LIMITS_FINAL */
const ChangeLimitsScreen = () => {
  const navigation = useNavigation();
  const cl = useChangeLimits();
  const { control, handleSubmit, setValue } = useForm<ChangeLimitsForm>({ defaultValues: cl.initialValues, mode: "onTouched" });
  const off = useWatch({ control, name: "serviceOff" });

  return (
    <Screen edges={["bottom"]}>
      <BaseCard className="p-5">
        {cl.action.step !== "idle" ? (
          <AuthorisedActionPanel action={cl.action} submitLabel={t("Update limit")} doneLabel={t("Done")} onDone={() => navigation.goBack()} />
        ) : (
          <View className="gap-4">
            <View className="flex-row gap-3">
              <Stat label={t("Current limit")} value={`${cl.currency} ${formatAmount(cl.serviceOff ? 0 : cl.currentLimit)}`} />
              <Stat label={t("Maximum allowed")} value={`${cl.currency} ${formatAmount(cl.maxLimit)}`} />
            </View>
            <FormSwitch
              control={control}
              name="serviceOff"
              label={t("Turn off transfers to others")}
              onChange={(v) => setValue("amount", cl.amountForToggle(v), { shouldValidate: true })}
            />
            <FormInput
              control={control}
              name="amount"
              label={t("New daily limit")}
              inputType="amount"
              keyboardType="decimal-pad"
              editable={!off}
              rules={off ? undefined : required("New daily limit", validators.amount(), validators.maxAmount(cl.maxLimit))}
            />
            <BaseButton label={t("Continue")} onPress={handleSubmit(cl.submit)} loading={cl.loading} />
          </View>
        )}
      </BaseCard>
    </Screen>
  );
};

export default ChangeLimitsScreen;
