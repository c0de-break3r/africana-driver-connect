declare module "react-native-metamap-sdk" {
  export const MetaMapRNSdk: {
    showFlow(
      clientId: string,
      flowId?: string | null,
      metadata?: Record<string, string> | null,
    ): void;
    showFlowWithConfigurationId(
      clientId: string,
      flowId?: string | null,
      metadata?: Record<string, string> | null,
      configurationId?: string | null,
      encryptionConfigurationId?: string | null,
    ): void;
  };
}
