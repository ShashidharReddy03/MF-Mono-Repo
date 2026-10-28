export type PublicStackParamList = {
  Welcome: undefined;
  Preferences: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends PublicStackParamList {}
  }
}
