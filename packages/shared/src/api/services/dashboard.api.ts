import { apiRequest } from "../requestConfig";
import type {
  BalanceEnquiryPayload,
  BalanceEnquiryResponse,
  MiniStatementPayload,
  MiniStatementResponse,
} from "../../types";

export const fetchBalance = (p: BalanceEnquiryPayload) =>
  apiRequest<BalanceEnquiryResponse, BalanceEnquiryPayload>("BALANCE_ENQUIRY", p);

export const fetchMiniStatement = (p: MiniStatementPayload) =>
  apiRequest<MiniStatementResponse, MiniStatementPayload>("MINI_STATEMENT", p);
