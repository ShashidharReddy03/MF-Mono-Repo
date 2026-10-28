/**
 * Adapts the platform-agnostic validators from @mf-bank/shared into
 * react-hook-form rules — the mobile twin of apps/web/src/core/utils/antdRules.ts.
 * Same validators → identical error messages on both platforms.
 */
import { runValidators, validators, type Validator } from "@mf-bank/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyValues = any;

/** Wrap shared validators into an RHF `rules` object */
export const rule = (...list: Validator[]) => ({
  validate: (value: AnyValues, all: AnyValues) => runValidators(list, value, all as Record<string, unknown>) ?? true,
});

/** Required + extra validators (the common case) */
export const required = (label: string, ...rest: Validator[]) => rule(validators.required(label), ...rest);

export const requiredSelect = (label: string) => rule(validators.requiredSelect(label));
