/**
 * In-memory backend used when USE_MOCK=true.
 *
 * It returns the SAME decrypted shapes as processibsrequest.jsp:
 *   { ResultMessage: '{"Status":"00","Message":...}', statuscodep, SessionID }
 * so the whole validation / session-timeout pipeline is exercised.
 * Encryption is skipped (there is no server to decrypt it).
 */
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { Beneficiary, RawServerResponse } from "../../types";
import type { ServiceRequest } from "../requestConfig";
import { isWeakMpin } from "../../utils/validators";
import {
  createMockBeneficiaries,
  generateTransactions,
  MOCK_ACCOUNTS,
  MOCK_BALANCES,
  MOCK_CREDENTIALS as C,
  MOCK_OTHER_BANKS,
  REG_SECURITY_QUESTIONS,
} from "./mockData";

dayjs.extend(customParseFormat);

type Req = ServiceRequest & Record<string, unknown>;

const state = {
  sessionId: "0",
  pendingSessionId: "0",
  loginOtpAttempts: 3,
  mpinFails: 0,
  /** username → MPIN for customers who can sign in on mobile (mock only; a real server stores a hash) */
  mpins: new Map<string, string>([[C.username, C.mpin]]),
  beneficiaries: createMockBeneficiaries(),
  pendingBeneficiary: null as Beneficiary | null,
  takenUsernames: new Set(["demo", "admin", "test"]),
  password: C.password as string,
  limits: { globalLimit: 100000, currentAppLimit: 50000, isLimitToggleOff: "N" as "Y" | "N" },
  /** confirmed but not yet authorised transfer / profile change */
  pendingTransfer: null as null | { kind: "OWN" | "SCU" | "LOCAL"; from: string; to?: string; amount: number; details: { label: string; value: string }[] },
  pendingPassword: null as string | null,
  pendingLimits: null as null | { newLimit: number; isToggleOff: "Y" | "N" },
};

const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (v: unknown) => Number(String(v ?? "").replace(/,/g, "")) || 0;
const OTP_FAIL = () => fail("Invalid OTP. Please try again.");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ok = (Message: unknown, extra: Partial<RawServerResponse> = {}): RawServerResponse => ({
  statuscodep: "00",
  ResultMessage: JSON.stringify({ Status: "00", Message }),
  SessionID: state.sessionId,
  ...extra,
});

const fail = (Message: string, Status = "01"): RawServerResponse => ({
  statuscodep: "00",
  ResultMessage: JSON.stringify({ Status, Message }),
});

const sessionExpired = (): RawServerResponse => ({
  statuscodep: "98",
  ResultMessage: "Your session has expired. Please login again.",
  SessionID: "0",
});

const PUBLIC_SERVICES = new Set([
  "SERVICE_AUTH", "GENERATE_OTP_FOR_LOGIN", "MPIN_LOGIN", "LOG_OUT_REQ", "PRELOGIN_RESEND_OTP",
  "REGISTRATION_CUST_DETAILS", "REGISTRATION_OTP", "REGISTRATION_SECU_QA",
  "REGISTRATION_CREATE_USERNAME", "REGISTRATION_USERNAME_PASSWORD", "REGISTRATION_USERNAME_MPIN",
  "PRELOGIN_EMAIL_VALIDATION", "PRELOGIN_SQANS_VALIDATION", "PRELOGIN_OTP_VALIDATION",
  "PRELOGIN_FORGOTPASSWORD_VALIDATION", "FORGOTUSERNAME_EMAIL", "FORGOTUSERNAME_QA",
  "FORGOTUSERNAME_OTP", "OTP_GENERATION",
]);

const recoveryQuestions = [
  { id: "Q1", question: "What was the name of your first pet?" },
  { id: "Q2", question: "In which city were you born?" },
];

const MPIN_MAX_FAILS = 5;

/** Customer profile returned by both OTP login and MPIN login */
const loginDBData = (uid: string = C.username) =>
  JSON.stringify({
    Status: "00",
    Message: {
      CIF: C.cif, CNAME: "Pushpa Gowda", CMOBILE: "25XXX45", customerEmail: C.email,
      LastLogin: dayjs().subtract(1, "day").format("DD MMM YYYY, hh:mm A"),
      CustomerStatus: "A", otpTimer: "60",
      displaySecurityQuestion: "N", PwdTobeChanged: "N", PwdTobeChangedExpired: "N",
      sourceAccountList: MOCK_ACCOUNTS, primaryAccountDetails: [MOCK_ACCOUNTS[0]],
      BeneficiaryBankName: MOCK_OTHER_BANKS,
      userName: uid, limitsCurrency: "SCR",
      globalLimit: money(state.limits.globalLimit),
      currentAppLimit: money(state.limits.currentAppLimit),
      isLimitToggleOff: state.limits.isLimitToggleOff,
    },
  });

const handlers: Record<string, (r: Req) => RawServerResponse> = {
  // ---------- AUTH ----------
  SERVICE_AUTH: (r) => {
    if (r.UID !== C.username || r.PWD !== state.password) {
      return { statuscodep: "98", SessionID: "0", ResultMessage: "Invalid username or password." };
    }
    state.pendingSessionId = `MOCK${Date.now()}`;
    state.loginOtpAttempts = 3;
    return { statuscodep: "00", SessionID: state.pendingSessionId, ResultMessage: "OTP sent" };
  },

  GENERATE_OTP_FOR_LOGIN: (r) => {
    if (r.ReqSessionID !== state.pendingSessionId) return sessionExpired();
    if (r.otp !== C.otp) {
      return { statuscodep: "01", ResultMessage: "Invalid OTP. Please try again." };
    }
    state.sessionId = state.pendingSessionId;
    return { statuscodep: "00", SessionID: state.sessionId, DBData: loginDBData() };
  },

  // ---------- MPIN (mobile) ----------
  MPIN_LOGIN: (r) => {
    if (state.mpinFails >= MPIN_MAX_FAILS) {
      return { statuscodep: "01", SessionID: "0", ResultMessage: "Your MPIN is locked. Please contact the bank or reset it." };
    }
    if (!state.mpins.has(String(r.UID)) || state.mpins.get(String(r.UID)) !== r.MPIN) {
      state.mpinFails += 1;
      const left = MPIN_MAX_FAILS - state.mpinFails;
      return {
        statuscodep: "01",
        SessionID: "0",
        ResultMessage: left > 0 ? `Incorrect username or MPIN. ${left} attempt(s) left.` : "Your MPIN is locked. Please contact the bank or reset it.",
      };
    }
    state.mpinFails = 0;
    state.sessionId = `MOCK${Date.now()}`;
    return { statuscodep: "00", SessionID: state.sessionId, DBData: loginDBData(String(r.UID)) };
  },

  OTP_GENERATION: () => {
    state.loginOtpAttempts = Math.max(0, state.loginOtpAttempts - 1);
    return ok({
      otpScreenHeader: "OTP Sent",
      otpScreenMsg: `OTP resent successfully (use ${C.otp})`,
      remainingAttempts: state.loginOtpAttempts,
    });
  },

  PRELOGIN_RESEND_OTP: () =>
    ok({ otpScreenHeader: "OTP Sent", otpScreenMsg: `OTP resent successfully (use ${C.otp})` }),

  LOG_OUT_REQ: () => {
    state.sessionId = "0";
    return { statuscodep: "00", ResultMessage: "Logged out", SessionID: "0" };
  },

  // ---------- REGISTRATION ----------
  REGISTRATION_CUST_DETAILS: (r) => {
    if (!/^\d{10,16}$/.test(String(r.accountNumber))) return fail("Account number not found.");
    return ok({
      confScreenHeader: "Verify your details",
      confScreenMsg: `An OTP has been sent to your registered mobile (use ${C.otp}).`,
      otpTimer: "60",
      Details: [
        { label: "Customer Name", value: "Pushpa Gowda" },
        { label: "Account Number", value: String(r.accountNumber) },
      ],
    });
  },
  REGISTRATION_OTP: (r) => (r.otp === C.otp ? ok(REG_SECURITY_QUESTIONS) : fail("Invalid OTP.")),
  REGISTRATION_SECU_QA: () => ok("Security questions saved."),
  REGISTRATION_CREATE_USERNAME: (r) =>
    state.takenUsernames.has(String(r.username).toLowerCase())
      ? fail("Username already taken. Please try another.")
      : ok("Username is available."),
  REGISTRATION_USERNAME_PASSWORD: (r) => {
    state.takenUsernames.add(String(r.username).toLowerCase());
    return ok({
      finalScreenHeader: "Registration Successful",
      finalScreenMsg: "You can now log in to MF Bank Internet Banking.",
      Details: [{ label: "Username", value: String(r.username) }],
    });
  },

  REGISTRATION_USERNAME_MPIN: (r) => {
    const username = String(r.username).toLowerCase();
    const mpin = String(r.mpin ?? "");
    if (state.takenUsernames.has(username)) return fail("Username already taken. Please try another.");
    if (!/^\d{6}$/.test(mpin) || isWeakMpin(mpin)) return fail("Please choose a stronger 6-digit MPIN.");
    if (mpin !== r.confirmMpin) return fail("MPINs do not match.");
    state.takenUsernames.add(username);
    state.mpins.set(username, mpin);
    return ok({
      finalScreenHeader: "Registration Successful",
      finalScreenMsg: "You can now log in to MF Bank mobile banking with your username and MPIN.",
      Details: [{ label: "Username", value: username }],
    });
  },

  // ---------- RECOVERY ----------
  PRELOGIN_EMAIL_VALIDATION: (r) => recoveryUser(r),
  FORGOTUSERNAME_EMAIL: (r) => recoveryUser(r),
  PRELOGIN_SQANS_VALIDATION: (r) => recoveryAnswers(r),
  FORGOTUSERNAME_QA: (r) => recoveryAnswers(r),
  PRELOGIN_OTP_VALIDATION: (r) =>
    r.otp === C.otp ? ok({ finalScreenHeader: "Verified", finalScreenMsg: "OTP verified." }) : fail("Invalid OTP."),
  FORGOTUSERNAME_OTP: (r) =>
    r.otp === C.otp
      ? ok({
          finalScreenHeader: "Username Recovered",
          finalScreenMsg: "Your username has also been sent to your registered email.",
          Details: [{ label: "Username", value: C.username }],
        })
      : fail("Invalid OTP."),
  PRELOGIN_FORGOTPASSWORD_VALIDATION: () =>
    ok({
      finalScreenHeader: "Password Reset Successful",
      finalScreenMsg: "Your password has been changed. Please log in with your new password.",
    }),

  // ---------- DASHBOARD / STATEMENTS ----------
  BALANCE_ENQUIRY: (r) => {
    const bal = MOCK_BALANCES[String(r.Account)];
    return bal ? ok(bal) : fail("Balance not available.");
  },
  MINI_STATEMENT: (r) => {
    const all = generateTransactions(String(r.account), dayjs().subtract(30, "day").toDate(), new Date())
      .slice(0, r.dashboard === "Y" ? 5 : 10)
      .map(({ Balance: _b, ...row }) => row);
    return ok({
      Currency: MOCK_ACCOUNTS.find((a) => a.accountNumber === r.account)?.currency ?? "SCR",
      ALL: all,
      CREDIT: all.filter((t) => t.Indicator === "Cr"),
      DEBIT: all.filter((t) => t.Indicator === "Dr"),
    });
  },
  FULL_STATEMENT: (r) => {
    const from = dayjs(String(r.FromDate), "DD-MM-YYYY").toDate();
    const to = dayjs(String(r.ToDate), "DD-MM-YYYY").toDate();
    if (r.format !== "view") {
      return ok({ ReportURL: "" }); // client falls back to local CSV export in mock mode
    }
    return ok({
      Account: r.Account,
      DateRange: `${r.FromDate} to ${r.ToDate}`,
      Currency: MOCK_ACCOUNTS.find((a) => a.accountNumber === r.Account)?.currency ?? "SCR",
      Transactions: generateTransactions(String(r.Account), from, to),
    });
  },

  // ---------- BENEFICIARIES ----------
  VIEW_BENEFICIARY_LIST: () => ok(state.beneficiaries),
  DELETE_BENEFICIARY: (r) => {
    state.beneficiaries = state.beneficiaries.filter((b) => b.benid !== r.benId);
    return ok("Beneficiary deleted successfully.");
  },
  OTHER_SCU_BEN_DETAILS: (r) => {
    const acc = String(r.benAccount);
    if (!/^\d{10}$/.test(acc)) return fail("Invalid MF Bank account number.");
    if (MOCK_ACCOUNTS.some((a) => a.accountNumber === acc)) return fail("You cannot add your own account.");
    return ok({ "Beneficiary Name": "Neha Patel", "Account Number": acc, "Mobile Number": "25XXX99", Currency: "SCR" });
  },
  SAVE_OTHER_SCU_BEN_CONF: (r) => stageBeneficiary(r, "SCU"),
  SAVE_LOCAL_BANK_BEN_CONF: (r) => stageBeneficiary(r, "LOCAL"),
  SAVE_OTHER_SCU_BEN: (r) => commitBeneficiary(r),
  SAVE_LOCAL_BANK_BEN: (r) => commitBeneficiary(r),

  // ---------- FUND TRANSFER ----------
  FT_OWN_ACCOUNT_CONFIRMATION: (r) => stageTransfer(r, "OWN"),
  FT_OTHER_SCU_CONFIRMATION: (r) => stageTransfer(r, "SCU"),
  FT_LOCAL_BANK_CONFIRMATION: (r) => stageTransfer(r, "LOCAL"),
  FT_OWN_ACCOUNT_FINAL: () => commitTransfer(null),
  FT_OTHER_SCU_FINAL: (r) => commitTransfer(String(r.otp)),
  FT_LOCAL_BANK_FINAL: (r) => commitTransfer(String(r.otp)),

  // ---------- MY PROFILE ----------
  LINKED_ACCOUNTS_LIST: () =>
    ok(MOCK_ACCOUNTS.map((a) => ({ accountName: a.alias || a.accountName, accountType: a.accountType, currency: a.currency, accountNumber: a.accountNumber, status: a.accountStatus }))),
  SECURITY_QUESTIONS: () => ok(REG_SECURITY_QUESTIONS),
  CHANGE_PASSWORD_CONF: (r) => {
    if (r.oldPassword !== state.password) return fail("Current password is incorrect.");
    if (r.newPassword === state.password) return fail("New password must be different from the current password.");
    state.pendingPassword = String(r.newPassword);
    return ok("OTP sent");
  },
  SAVE_CHANGE_PASSWORD: (r) => {
    if (r.otp !== C.otp) return OTP_FAIL();
    if (state.pendingPassword) state.password = state.pendingPassword;
    state.pendingPassword = null;
    state.sessionId = "0";
    return ok({ finalScreenHeader: "Password changed", finalScreenMsg: "Please log in again with your new password." });
  },
  CHANGE_SECQUESTIONS_CONF: (r) =>
    Array.isArray(r.securityQuestions) && r.securityQuestions.length === 4 ? ok("OTP sent") : fail("Please answer all security questions."),
  CHANGE_SECQUESTIONS_FINAL: (r) =>
    r.otp === C.otp
      ? ok({ finalScreenHeader: "Security questions updated", finalScreenMsg: "Your new security questions are saved." })
      : OTP_FAIL(),
  CHANGE_LIMITS_CONF: (r) => {
    const newLimit = num(r.newLimit);
    if (newLimit > state.limits.globalLimit) return fail(`The limit cannot exceed SCR ${money(state.limits.globalLimit)}.`);
    const isToggleOff = r.isToggleOff === "Y" ? "Y" : "N";
    state.pendingLimits = { newLimit, isToggleOff };
    return ok({
      confScreenHeader: "Confirm new limit",
      confScreenMsg: "Please review your new transfer limit.",
      Details: [
        { label: "Current Limit", value: `SCR ${money(state.limits.currentAppLimit)}` },
        { label: "New Limit", value: `SCR ${money(newLimit)}` },
        { label: "Transfers to others", value: isToggleOff === "Y" ? "Off" : "On" },
      ],
    });
  },
  CHANGE_LIMITS_FINAL: (r) => {
    if (r.otp !== C.otp) return OTP_FAIL();
    const p = state.pendingLimits;
    if (p) state.limits = { ...state.limits, currentAppLimit: p.newLimit, isLimitToggleOff: p.isToggleOff };
    state.pendingLimits = null;
    return ok({
      finalScreenHeader: "Limit updated",
      finalScreenMsg: "Your new transfer limit is active now.",
      // labels match what MF-React-SCU reads back after success
      Details: [
        { label: "New Limit", value: money(state.limits.currentAppLimit) },
        { label: "Toggle On/off", value: state.limits.isLimitToggleOff },
      ],
    });
  },
};

function stageTransfer(r: Req, kind: "OWN" | "SCU" | "LOCAL") {
  const from = String(r.sourceAccount);
  const fromAcc = MOCK_ACCOUNTS.find((a) => a.accountNumber === from);
  const bal = MOCK_BALANCES[from];
  const amount = num(r.amount);
  if (!fromAcc || !bal) return fail("Please select a valid account.");
  if (amount <= 0) return fail("Please enter a valid amount.");
  if (amount > num(bal.AvailableBalance)) return fail("Insufficient balance in the selected account.");
  const cur = fromAcc.currency;

  let to = "";
  let toLabel = "";
  const extra: { label: string; value: string }[] = [];
  if (r.benId) {
    const b = state.beneficiaries.find((x) => x.benid === r.benId);
    if (!b) return fail("Beneficiary not found.");
    to = b.beneficiaryAcno;
    toLabel = `${b.beneficiaryName} · ${b.maskedAcno}`;
    if (b.beneficiaryBank) extra.push({ label: "Bank", value: b.beneficiaryBank });
  } else {
    to = String(r.toAccount);
    if (kind === "OWN") {
      const acc = MOCK_ACCOUNTS.find((a) => a.accountNumber === to);
      toLabel = acc ? `${acc.alias} · ${to}` : to;
    } else if (kind === "SCU") {
      toLabel = `${r.benName} · ${to}`;
    } else {
      toLabel = `${r.benFirstName} ${r.benLastName} · ${to}`;
      extra.push({ label: "Bank", value: MOCK_OTHER_BANKS.find((b) => b.bankCode === r.bankCode)?.bankName ?? String(r.bankCode) });
    }
    if (r.saveBen === "Y") extra.push({ label: "Save beneficiary", value: `Yes (${r.benAlias})` });
  }

  const details = [
    { label: "From Account", value: `${fromAcc.alias} · ${from}` },
    { label: "To", value: toLabel },
    ...extra,
    { label: "Amount", value: `${cur} ${money(amount)}` },
    ...(kind !== "OWN" ? [{ label: "Charges", value: kind === "LOCAL" ? `${cur} 25.00` : `${cur} 0.00` }] : []),
    { label: "Narration", value: String(r.remarks ?? r.narration ?? "") },
    ...(r.purposeOfTransfer ? [{ label: "Purpose", value: String(r.purposeOfTransfer) }] : []),
  ];
  state.pendingTransfer = { kind, from, to, amount, details };
  return ok({
    confScreenHeader: "Confirm transfer",
    confScreenMsg: "Please check the details before you confirm.",
    otpScreenHeader: "Authorise transfer",
    otpScreenMsg: `Enter the OTP sent to your registered mobile (use ${C.otp}).`,
    Details: details,
  });
}

function commitTransfer(otp: string | null) {
  const p = state.pendingTransfer;
  if (!p) return fail("No transfer to authorise. Please start again.");
  if (otp !== null && otp !== C.otp) return OTP_FAIL();
  state.pendingTransfer = null;
  const ref = `FT${Date.now().toString().slice(-9)}`;

  // transfers to others follow the customer's limit (My Profile → Transfer limit) — shows the "failed" result
  if (p.kind !== "OWN" && (state.limits.isLimitToggleOff === "Y" || p.amount > state.limits.currentAppLimit)) {
    return {
      statuscodep: "00",
      ResultMessage: JSON.stringify({
        Status: "06",
        Message: {
          finalScreenHeader: "Transfer failed",
          finalScreenMsg:
            state.limits.isLimitToggleOff === "Y"
              ? "Transfers to others are switched off in your transfer limit settings."
              : `The amount exceeds your transfer limit of SCR ${money(state.limits.currentAppLimit)}.`,
          refrenceNumber: ref,
          Details: [{ label: "Reference Number", value: ref }, ...p.details],
        },
      }),
      SessionID: state.sessionId,
    };
  }

  const debit = (acc: string, delta: number) => {
    const b = MOCK_BALANCES[acc];
    if (!b) return;
    b.AvailableBalance = money(num(b.AvailableBalance) + delta);
    b.CurrentBalance = money(num(b.CurrentBalance) + delta);
  };
  debit(p.from, -p.amount);
  if (p.kind === "OWN" && p.to) debit(p.to, p.amount);

  return ok({
    finalScreenHeader: "Transfer successful",
    finalScreenMsg: "Your money is on its way.",
    refrenceNumber: ref,
    Details: [{ label: "Reference Number", value: ref }, ...p.details],
  });
}

function recoveryUser(r: Req) {
  if (r.cif !== C.cif || String(r.email).toLowerCase() !== C.email) {
    return fail("CIF / email combination does not match our records.");
  }
  return ok(recoveryQuestions);
}

function recoveryAnswers(r: Req) {
  if (!r.QA1 || !r.QA2) return fail("Please answer all security questions.");
  return ok({ message: `An OTP has been sent to your registered mobile (use ${C.otp}).`, otpTimer: "60" });
}

function stageBeneficiary(r: Req, Type: "SCU" | "LOCAL") {
  const acc = String(r.benAccount);
  if (state.beneficiaries.some((b) => b.beneficiaryAcno === acc)) {
    return fail("This beneficiary already exists.");
  }
  const name = Type === "SCU" ? String(r.benName) : `${r.benFirstName} ${r.benLastName}`;
  const bank = Type === "LOCAL" ? MOCK_OTHER_BANKS.find((b) => b.bankCode === r.bankCode)?.bankName : undefined;
  state.pendingBeneficiary = {
    benid: `B${Date.now()}`,
    Type,
    beneficiaryName: name,
    beneficiaryAcno: acc,
    maskedAcno: acc.replace(/.(?=.{4})/g, "X"),
    beneficiaryMobile: String(r.benMobile),
    beneficiaryEmail: String(r.benEmail || ""),
    beneficiaryBank: bank,
    "Alias Name": String(r.benAlias),
  };
  return ok({
    confScreenHeader: "Confirm Beneficiary",
    confScreenMsg: "Please review the beneficiary details.",
    otpScreenHeader: "Authorise with OTP",
    otpScreenMsg: `Enter the OTP sent to your registered mobile (use ${C.otp}).`,
    Details: [
      { label: "Beneficiary Name", value: name },
      { label: "Account Number", value: acc },
      ...(bank ? [{ label: "Bank", value: bank }] : []),
      { label: "Nickname", value: String(r.benAlias) },
      { label: "Mobile", value: String(r.benMobile) },
      ...(r.benEmail ? [{ label: "Email", value: String(r.benEmail) }] : []),
    ],
  });
}

function commitBeneficiary(r: Req) {
  if (r.otp !== C.otp) return fail("Invalid OTP.");
  const b = state.pendingBeneficiary;
  if (!b) return fail("Nothing to confirm. Please start again.");
  state.beneficiaries = [b, ...state.beneficiaries];
  state.pendingBeneficiary = null;
  return ok({
    finalScreenHeader: "Beneficiary Added",
    finalScreenMsg: `${b.beneficiaryName} has been added to your beneficiaries.`,
    Details: [
      { label: "Nickname", value: b["Alias Name"] },
      { label: "Account", value: b.maskedAcno },
    ],
  });
}

export const mockServer = {
  async handle(request: ServiceRequest): Promise<RawServerResponse> {
    await sleep(350 + Math.random() * 400);
    const service = request.ReqService;
    const handler = handlers[service];
    if (!handler) return fail(`Mock: service ${service} not implemented`, "04");

    const isPrivate = !PUBLIC_SERVICES.has(service);
    if (isPrivate && (request.ReqSessionID === "0" || request.ReqSessionID !== state.sessionId)) {
      return sessionExpired();
    }
    return handler(request as Req);
  },
};
