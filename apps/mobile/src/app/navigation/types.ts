import type { NavigatorScreenParams } from "@react-navigation/native";

export type PublicStackParamList = {
  Login: undefined;
  Registration: undefined;
  ForgotPassword: undefined;
  ForgotUsername: undefined;
  Preferences: undefined;
};

export type PrivateTabParamList = {
  Dashboard: undefined;
  Transfer: undefined;
  Statements: { account?: string } | undefined;
  Beneficiaries: undefined;
  Settings: undefined;
};

export type PrivateStackParamList = {
  Tabs: NavigatorScreenParams<PrivateTabParamList>;
  AddBeneficiary: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  ChangeLimits: undefined;
  SecurityQuestions: undefined;
};

export type RootParamList = PublicStackParamList & PrivateStackParamList;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // Enables typed useNavigation() everywhere
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends PrivateStackParamList, PublicStackParamList {}
  }
}
