import { EyeInvisibleOutlined, EyeOutlined, LoadingOutlined } from "@ant-design/icons";
import { formatAmount, maskAccount, type Account, type Balance, t } from "@mf-bank/shared";

type Props = {
  account: Account;
  balance?: Balance;
  visible: boolean;
  loading: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
};

/** Navy card — the one decorative element in the app. Balance hidden until tapped. */
const DAccountCard = ({ account, balance, visible, loading, selected, onSelect, onToggle }: Props) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(e) => e.key === "Enter" && onSelect()}
    data-selected={selected}
    className="account-card flex min-h-[176px] cursor-pointer flex-col justify-between rounded-2xl p-5 text-white transition-shadow"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-white/60">{account.accountType}</div>
        <div className="mt-1 text-base font-semibold">{account.alias || account.accountName}</div>
      </div>
      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide">
        {account.accountStatus}
      </span>
    </div>

    <div>
      <div className="text-xs text-white/60">{t("Available balance")}</div>
      <div className="mt-1 flex items-center gap-3">
        <span dir="ltr" className="text-2xl font-bold tabular-nums">
          {visible && balance ? formatAmount(balance.AvailableBalance, account.currency) : `${account.currency} ••••••`}
        </span>
        <button
          type="button"
          aria-label={visible ? t("Hide balance") : t("Show balance")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          {loading ? <LoadingOutlined /> : visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </button>
      </div>
      {visible && balance && (
        <div className="mt-1 text-xs text-white/60">
          {t("Current balance")} <span dir="ltr">{formatAmount(balance.CurrentBalance, account.currency)}</span>
        </div>
      )}
    </div>

    <div dir="ltr" className="font-mono text-sm tracking-widest text-white/80 rtl:text-end">{maskAccount(account.accountNumber)}</div>
  </div>
);

export default DAccountCard;
