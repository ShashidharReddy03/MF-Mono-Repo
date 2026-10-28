import type { Account, Beneficiary, FullStatementTransactionRow, OtherBank } from "../../types";

export const MOCK_CREDENTIALS = {
  username: "demo",
  password: "Demo@1234",
  otp: "123456",
  /** Mobile login MPIN (6 digits) */
  mpin: "246810",
  cif: "100200300",
  email: "demo@mfbank.com",
} as const;

export const MOCK_ACCOUNTS: Account[] = [
  { accountName: "Pushpa Gowda", accountType: "Savings", alias: "Salary Account", currency: "SCR", accountNumber: "1002003001", accountStatus: "Active" },
  { accountName: "Pushpa Gowda", accountType: "Current", alias: "Business", currency: "SCR", accountNumber: "1002003002", accountStatus: "Active" },
  { accountName: "Pushpa Gowda", accountType: "Savings", alias: "USD Savings", currency: "USD", accountNumber: "1002003003", accountStatus: "Active" },
];

export const MOCK_BALANCES: Record<string, { AvailableBalance: string; CurrentBalance: string }> = {
  "1002003001": { AvailableBalance: "48,250.75", CurrentBalance: "49,000.00" },
  "1002003002": { AvailableBalance: "1,26,540.10", CurrentBalance: "1,30,000.00" },
  "1002003003": { AvailableBalance: "3,420.00", CurrentBalance: "3,420.00" },
};

export const MOCK_OTHER_BANKS: OtherBank[] = [
  { bankCode: "ABSA", bankName: "Absa Bank" },
  { bankCode: "BOB", bankName: "Bank of Baroda" },
  { bankCode: "MCB", bankName: "MCB Seychelles" },
  { bankCode: "NOUVOBANQ", bankName: "Nouvobanq" },
];

export const createMockBeneficiaries = (): Beneficiary[] => [
  { benid: "B001", Type: "SCU", beneficiaryName: "Priya Sharma", beneficiaryAcno: "1005006001", maskedAcno: "XXXXXX6001", beneficiaryMobile: "2512345", beneficiaryEmail: "priya@example.com", "Alias Name": "Priya" },
  { benid: "B002", Type: "SCU", beneficiaryName: "Rahul Verma", beneficiaryAcno: "1005006002", maskedAcno: "XXXXXX6002", beneficiaryMobile: "2598765", "Alias Name": "Landlord" },
  { benid: "B003", Type: "LOCAL", beneficiaryName: "Maria Hoareau", beneficiaryAcno: "88001234567", maskedAcno: "XXXXXXX4567", beneficiaryMobile: "2711223", beneficiaryBank: "MCB Seychelles", beneficiaryEmail: "maria@example.com", "Alias Name": "Maria MCB" },
];

const DESCRIPTIONS = [
  ["Salary Credit", "Cr"], ["ATM Withdrawal", "Dr"], ["POS - Supermarket", "Dr"],
  ["Transfer from Priya", "Cr"], ["Electricity Bill (PUC)", "Dr"], ["Mobile Recharge", "Dr"],
  ["Interest Credit", "Cr"], ["Transfer to Landlord", "Dr"], ["Refund - Online Store", "Cr"],
  ["Fuel Station", "Dr"],
] as const;

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ddmmyyyy = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

/** Deterministic pseudo-random transactions between two dates (newest first) */
export const generateTransactions = (
  account: string,
  from: Date,
  to: Date,
): FullStatementTransactionRow[] => {
  let seed = Number(account.slice(-4)) || 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const rows: FullStatementTransactionRow[] = [];
  let balance = 50_000;
  const day = 24 * 3600 * 1000;
  for (let t = from.getTime(); t <= to.getTime(); t += day * (1 + Math.floor(rand() * 3))) {
    const [desc, ind] = DESCRIPTIONS[Math.floor(rand() * DESCRIPTIONS.length)];
    const amount = Math.round((ind === "Cr" ? 500 + rand() * 9000 : 50 + rand() * 2500) * 100) / 100;
    balance += ind === "Cr" ? amount : -amount;
    rows.push({
      Date: ddmmyyyy(new Date(t)),
      Description: desc,
      Indicator: ind,
      Amount: fmt(amount),
      Balance: fmt(balance),
      TransactionId: `TXN${new Date(t).getTime().toString().slice(-8)}${rows.length}`,
    });
  }
  return rows.reverse();
};

export const REG_SECURITY_QUESTIONS = {
  SQ1: ["1-What was the name of your first pet?", "2-What is your mother's maiden name?", "3-What was your first car?"],
  SQ2: ["4-In which city were you born?", "5-What is your favourite book?", "6-What was the name of your primary school?"],
  SQ3: ["7-What is your favourite food?", "8-Who was your childhood hero?", "9-What was your first job?"],
  SQ4: ["10-What is your father's middle name?", "11-What is your favourite holiday destination?", "12-What street did you grow up on?"],
};
