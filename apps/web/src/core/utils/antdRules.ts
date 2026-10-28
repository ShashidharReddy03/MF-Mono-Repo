/**
 * Adapts the platform-agnostic validators from @mf-bank/shared into antd
 * Form `Rule`s. Mobile has an equivalent adapter for react-hook-form, so
 * both apps show identical messages from one definition.
 */
import type { FormInstance, FormRule } from "antd";
import { fieldLabel, type Validator, t } from "@mf-bank/shared";

/** Wrap one or more shared validators into a single antd rule */
export const rule =
  (...validators: Validator[]): FormRule =>
  (form: Pick<FormInstance, "getFieldsValue">) => ({
    validator(_, value) {
      const all = form.getFieldsValue(true) as Record<string, unknown>;
      for (const v of validators) {
        const error = v(value, all);
        if (error) return Promise.reject(new Error(error));
      }
      return Promise.resolve();
    },
  });

/** Mark a field required (shows antd's required asterisk) + validator */
export const required = (label: string, ...rest: Validator[]): FormRule[] => [
  { required: true, message: t("Please enter {{field}}", { field: fieldLabel(label) }) },
  ...(rest.length ? [rule(...rest)] : []),
];
