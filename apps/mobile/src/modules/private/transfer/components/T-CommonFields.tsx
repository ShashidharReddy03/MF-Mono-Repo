import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWatch, type Control, type FieldValues, type Path } from "react-hook-form";
import {
  BENEFICIARY_TYPE_LABEL,
  colors,
  DEFAULT_COUNTRY_CODE,
  SEFT_NOTICE,
  t,
  TRANSFER_TEXT_MAX,
  TRANSFER_TEXT_MIN,
  validators,
  type FundTransfer,
} from "@mf-bank/shared";
import { required, requiredSelect, rule } from "@/core/utils/rhfRules";
import FormInput from "@/shared/ui/form/FormInput";
import FormSelect from "@/shared/ui/form/FormSelect";
import FormCheckbox from "@/shared/ui/form/FormCheckbox";
import FormSegmented from "@/shared/ui/form/FormSegmented";
import DetailsList from "@/shared/ui/components/DetailsList";
import BaseText from "@/shared/ui/base/BaseText";

/* Mobile twins of the web T-CommonFields — same rules, same shared hook. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyControl = Control<any>;
const prefix = (text: string) => (
  <BaseText weight="medium" className="me-2 text-muted">
    {text}
  </BaseText>
);

export const TFromAccount = ({ ft, control }: { ft: FundTransfer; control: AnyControl }) => (
  <FormSelect control={control} name="fromAccount" label={t("From account")} placeholder={t("Select account")} options={ft.accountOptions} rules={requiredSelect("From account")} />
);

export const TAmountFields = ({
  control,
  currency,
  multipleOf100,
  withPurpose = true,
}: {
  control: AnyControl;
  currency: string;
  multipleOf100?: boolean;
  withPurpose?: boolean;
}) => (
  <>
    <FormInput
      control={control}
      name="amount"
      label={t("Amount")}
      inputType="amount"
      keyboardType="decimal-pad"
      placeholder="0.00"
      left={prefix(currency)}
      hint={multipleOf100 ? t("Shares accounts accept multiples of 100 only.") : undefined}
      rules={required("Amount", validators.amount(), ...(multipleOf100 ? [validators.multipleOf(100)] : []))}
    />
    <FormInput control={control} name="narration" label={t("Narration")} inputType="alphanumeric" maxLength={TRANSFER_TEXT_MAX} rules={required("Narration", validators.minLength(TRANSFER_TEXT_MIN))} />
    {withPurpose && (
      <FormInput
        control={control}
        name="purpose"
        label={t("Purpose of transfer")}
        inputType="alphanumeric"
        maxLength={TRANSFER_TEXT_MAX}
        rules={required("Purpose of transfer", validators.minLength(TRANSFER_TEXT_MIN))}
      />
    )}
  </>
);

export const TBeneficiarySource = ({ control }: { control: AnyControl }) => (
  <FormSegmented
    control={control}
    name="transferType"
    label={t("Beneficiary")}
    options={[
      { label: t("New beneficiary"), value: "OnceOff" },
      { label: t("Saved beneficiary"), value: "ViaBene" },
    ]}
  />
);

export function TSavedBeneficiary<T extends FieldValues>({ ft, control }: { ft: FundTransfer; control: Control<T> }) {
  const id = useWatch({ control, name: "bene" as Path<T> }) as string | undefined;
  const b = ft.beneficiaryById(id);
  return (
    <View className="gap-3">
      <FormSelect control={control} name={"bene" as Path<T>} label={t("Beneficiary")} placeholder={t("Select beneficiary")} options={ft.beneficiaryOptions} rules={requiredSelect("Beneficiary")} />
      {b && (
        <DetailsList
          items={[
            { label: t("Name"), value: b.beneficiaryName },
            { label: t("Account number"), value: b.maskedAcno },
            { label: t("Bank"), value: b.beneficiaryBank || BENEFICIARY_TYPE_LABEL[b.Type] },
          ]}
        />
      )}
    </View>
  );
}

export function TContactAndSave<T extends FieldValues>({ control }: { control: Control<T> }) {
  const save = useWatch({ control, name: "saveBene" as Path<T> }) as boolean | undefined;
  return (
    <>
      <FormInput control={control} name={"mobileNumber" as Path<T>} label={t("Mobile number")} inputType="number" maxLength={7} left={prefix(DEFAULT_COUNTRY_CODE)} rules={required("Mobile number", validators.mobile())} />
      <FormInput control={control} name={"email" as Path<T>} label={t("Email (optional)")} inputType="email" maxLength={50} rules={rule(validators.email())} />
      <FormCheckbox control={control} name={"saveBene" as Path<T>}>
        <BaseText className="text-sm">{t("Save as beneficiary for next time")}</BaseText>
      </FormCheckbox>
      {save && <FormInput control={control} name={"alias" as Path<T>} label={t("Nickname")} inputType="alphanumeric" maxLength={20} rules={required("Nickname")} />}
    </>
  );
}

/** SEFT cut-off notice that must be accepted before other-bank transfers */
export const TSeftNotice = ({ control }: { control: AnyControl }) => (
  <View className="gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-4">
    <View className="flex-row gap-2">
      <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
      <View className="flex-1">
        <BaseText weight="semibold" className="text-sm">
          {SEFT_NOTICE.title}
        </BaseText>
        <BaseText className="mt-0.5 text-xs text-muted">{SEFT_NOTICE.message}</BaseText>
        <BaseText className="mt-1 text-xs text-muted">{SEFT_NOTICE.warning}</BaseText>
      </View>
    </View>
    <FormCheckbox control={control} name="acceptSeft" rules={rule(validators.requiredCheckbox())}>
      <BaseText className="text-sm">{t("I have read and accept the terms and conditions")}</BaseText>
    </FormCheckbox>
  </View>
);
