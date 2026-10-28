import type { BaseResponse } from "./common.types";

export type StatementRangePreset = "current" | "last1" | "last3" | "custom";
export type StatementFormat = "view" | "pdf" | "xls";

export type FullStatementPayload = {
  Account: string;
  FromDate: string; // DD-MM-YYYY
  ToDate: string; // DD-MM-YYYY
  format: StatementFormat;
};

export type FullStatementTransactionRow = {
  Indicator: "Cr" | "Dr";
  Description: string;
  Amount: string;
  Balance: string;
  Date: string;
  TransactionId: string;
};

export type FullStatementData = {
  Account: string;
  DateRange: string;
  Currency: string;
  Transactions: FullStatementTransactionRow[];
};

export type StatementDownloadData = { ReportURL: string };

export type FullStatementResponse = BaseResponse<FullStatementData | StatementDownloadData>;

export type StatementSummary = {
  count: number;
  totalCredit: number;
  totalDebit: number;
  net: number;
};
