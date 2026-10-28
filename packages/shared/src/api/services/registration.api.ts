import { apiRequest } from "../requestConfig";
import type {
  CustomerVerificationResponse,
  RegistrationOTPPayload,
  RegistrationSuccessResponse,
  RegOTPResponse,
  RSecurityQuesPayload,
  RSetMpinPayload,
  RSetPasswordPayload,
  RValidateCustomerDetailsPayload,
  SimpleStringResponse,
  ValidateUsernamePayload,
} from "../../types";

export const validateCustomerDetails = (p: RValidateCustomerDetailsPayload) =>
  apiRequest<CustomerVerificationResponse, RValidateCustomerDetailsPayload>("REGISTRATION_CUST_DETAILS", p);

export const verifyRegistrationOtp = (p: RegistrationOTPPayload) =>
  apiRequest<RegOTPResponse, RegistrationOTPPayload>("REGISTRATION_OTP", p);

export const submitRegSecurityQuestions = (p: RSecurityQuesPayload) =>
  apiRequest<SimpleStringResponse, RSecurityQuesPayload>("REGISTRATION_SECU_QA", p);

export const checkUsernameAvailability = (p: ValidateUsernamePayload) =>
  apiRequest<SimpleStringResponse, ValidateUsernamePayload>("REGISTRATION_CREATE_USERNAME", p, {
    showErrorToast: false,
  });

export const setRegistrationCredentials = (p: RSetPasswordPayload) =>
  apiRequest<RegistrationSuccessResponse, RSetPasswordPayload>("REGISTRATION_USERNAME_PASSWORD", p);

/** Mobile: username + MPIN (service code to confirm with the backend) */
export const setRegistrationMpin = (p: RSetMpinPayload) =>
  apiRequest<RegistrationSuccessResponse, RSetMpinPayload>("REGISTRATION_USERNAME_MPIN", p);
