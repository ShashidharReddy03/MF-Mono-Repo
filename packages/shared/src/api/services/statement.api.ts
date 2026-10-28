import { apiRequest } from "../requestConfig";
import type { FullStatementPayload, FullStatementResponse } from "../../types";

export const fetchFullStatement = (p: FullStatementPayload) =>
  apiRequest<FullStatementResponse, FullStatementPayload>("FULL_STATEMENT", p);
