import { useState } from "react";
import BaseModal from "../base/BaseModal";
import BaseButton from "../base/BaseButton";
import { t } from "@mf-bank/shared";

type Props = {
  open: boolean;
  value: string;
  maxLength?: number;
  onChange: (v: string) => void;
  onClose: () => void;
};

const LETTER_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((r) => r.split(""));
const DIGITS = "0123456789".split("");
const SPECIAL = ["!", "@", "#", "&", "*"];

/** Fisher–Yates with the secure RNG */
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  const rnd = crypto.getRandomValues(new Uint32Array(a.length));
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Key = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <button
    type="button"
    onClick={onPress}
    className="h-10 min-w-[2.25rem] flex-1 rounded-md border border-primary/15 bg-white text-sm font-semibold text-primary hover:bg-secondary-light active:scale-95"
  >
    {label}
  </button>
);

/** Mounted only while the modal is open → digits reshuffle on every open */
const Keys = ({ value, maxLength, onChange, onClose }: Omit<Props, "open"> & { maxLength: number }) => {
  const [caps, setCaps] = useState(false);
  const [digits] = useState(() => shuffle(DIGITS));
  const format = (k: string) => (caps ? k.toUpperCase() : k);
  const press = (k: string) => {
    if (value.length < maxLength) onChange(value + format(k));
  };

  return (
    <>
      <div className="mb-3 rounded-md bg-surface px-3 py-2 text-center tracking-[0.4em] text-primary">
        {"•".repeat(value.length) || <span className="tracking-normal text-muted">{t("Type using the keys below")}</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        {[digits, ...LETTER_ROWS, SPECIAL].map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {row.map((k) => (
              <Key key={k} label={format(k)} onPress={() => press(k)} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <BaseButton label={caps ? "Caps on" : "Caps off"} type={caps ? "primary" : "default"} onClick={() => setCaps((c) => !c)} />
        <BaseButton label={t("Delete")} onClick={() => onChange(value.slice(0, -1))} />
        <BaseButton label={t("Done")} type="primary" onClick={onClose} />
      </div>
    </>
  );
};

/**
 * On-screen keyboard for password entry — defeats hardware key-loggers.
 * Digit row is shuffled on each open so click positions can't be replayed.
 */
const VirtualKeyboard = ({ open, maxLength = 12, ...rest }: Props) => (
  <BaseModal open={open} onCancel={rest.onClose} title={t("Virtual keyboard")} width={560} closable>
    {open && <Keys maxLength={maxLength} {...rest} />}
  </BaseModal>
);

export default VirtualKeyboard;
