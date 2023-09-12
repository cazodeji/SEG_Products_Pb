export interface brokerConfig {
  brokerId: string;
  pcSchemeCode: string;
  isSERL?: boolean;
  pcBrokerRate: string;
  pcSEGRate: string;
  stripePK?: string;
  stripeSK?: string;
  accessTokenExpiresOn?: string;
  accessToken?: string;
}
