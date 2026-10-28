import { View } from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { useRegistration, validators, type CustomerVerificationForm, t } from "@mf-bank/shared";
import { required, rule } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import FormSegmented from "@/shared/ui/form/FormSegmented";
import FormCheckbox from "@/shared/ui/form/FormCheckbox";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseText from "@/shared/ui/base/BaseText";

const RCustomerVerification = ({ onCancel }: { onCancel: () => void }) => {
  const { verifyCustomer, loading } = useRegistration();
  const { control, handleSubmit } = useForm<CustomerVerificationForm>({
    defaultValues: { registrationType: "New", accNum: "", mobileNumber: "", email: "", username: "", cif: "", terms: false },
    mode: "onTouched",
    shouldUnregister: true, // fields of the hidden branch are dropped from the payload
  });
  const type = useWatch({ control, name: "registrationType" });

  return (
    <View className="gap-4">
      <FormSegmented
        control={control}
        name="registrationType"
        label={t("I am")}
        options={[
          { get label() { return t("New to online banking"); }, value: "New" },
          { get label() { return t("Moving from old portal"); }, value: "Migration" },
        ]}
      />
      <FormInput
        control={control}
        name="accNum"
        label={t("Account number")}
        inputType="number"
        placeholder={t("10–16 digit account number")}
        maxLength={16}
        rules={required("Account number", validators.accountNumber())}
      />
      {type === "New" ? (
        <>
          <FormInput
            control={control}
            name="mobileNumber"
            label={t("Registered mobile number")}
            inputType="number"
            placeholder={t("7-digit mobile number")}
            maxLength={7}
            rules={required("Mobile number", validators.mobile())}
          />
          <FormInput
            control={control}
            name="email"
            label={t("Registered email")}
            inputType="email"
            placeholder="name@example.com"
            maxLength={60}
            rules={required("Email", validators.email())}
          />
        </>
      ) : (
        <>
          <FormInput
            control={control}
            name="username"
            label={t("Existing username")}
            inputType="username"
            placeholder={t("Your old portal username")}
            maxLength={25}
            rules={required("Username")}
          />
          <FormInput
            control={control}
            name="cif"
            label={t("Customer ID (CIF)")}
            inputType="number"
            placeholder={t("Printed on your passbook")}
            maxLength={12}
            rules={required("CIF", validators.cif())}
          />
        </>
      )}
      <FormCheckbox control={control} name="terms" rules={rule(validators.requiredCheckbox())}>
        <BaseText className="text-sm">{t("I agree to the Internet Banking terms and privacy policy.")}</BaseText>
      </FormCheckbox>
      <BaseButton label={t("Continue")} onPress={handleSubmit(verifyCustomer)} loading={loading} />
      <BaseButton label={t("Back to login")} variant="ghost" onPress={onCancel} />
    </View>
  );
};

export default RCustomerVerification;
