import type { BaseResponse } from "./common.types";

export type BalanceEnquiryPayload = { Account: string };
export type Balance = { AvailableBalance: string; CurrentBalance: string };
export type BalanceEnquiryResponse = BaseResponse<Balance>;

export type MiniTransactionRow = {
  Amount: string;
  Date: string;
  Indicator: "Cr" | "Dr";
  TransactionId: string;
  Description?: string;
};

export type MiniTransactionData = {
  ALL: MiniTransactionRow[];
  CREDIT: MiniTransactionRow[];
  DEBIT: MiniTransactionRow[];
};

export type MiniStatementPayload = { account: string; dashboard: "Y" | "N" };
export type MiniStatementResponse = BaseResponse<MiniTransactionData & { Currency: string }>;
export type MiniFilter = keyof MiniTransactionData;
