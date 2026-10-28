import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import { evaluatePassword } from "@mf-bank/shared";

/** Live password-policy checklist, rules come from @mf-bank/shared */
const PasswordChecklist = ({ password }: { password?: string }) => (
  <ul className="grid grid-cols-1 gap-1 rounded-lg bg-surface p-3 text-xs sm:grid-cols-2" aria-live="polite">
    {evaluatePassword(password).map((r) => (
      <li key={r.key} className={`flex items-center gap-2 ${r.passed ? "text-secondary-dark" : "text-muted"}`}>
        {r.passed ? <CheckCircleFilled /> : <CloseCircleOutlined />}
        {r.label}
      </li>
    ))}
  </ul>
);

export default PasswordChecklist;
