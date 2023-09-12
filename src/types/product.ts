export type Broker = {
  [id: string]: {
    brokerCollect: 'True' | 'False';
    sendWelcomeEmail: any;
    sendRenewalEmail: any;
    id: string;
    // TODO type to enum
    state: ProductStates;
    name?: string;
    type?: string;
    stripePK?: string;
    stripeSK?: string;
    insurers?: any;
    premiumCredit?: {
      scheme: string;
      pcRate: number;
      serlRate: number;
      brokerRate: number;
    };
  };
};

export type Product = {
  quoteEngine?: 'V1' | 'V2' | 'NF';
  id: string;
  productName: string;
  sendWelcomeEmail: boolean;
  sendRenewalEmail: boolean;
  brokers: Array<Broker>;
  avgAnnualGwp: string;
  category: string;
  links?: any;
  claimsHandler: string;
  claimsHandlerEmail: string;
  commission: string;
  description: string;
  images: {
    full: string;
  };
  documents?: any[];
  insurerName: string;
  policyHolderDescription: string;
  premiumType: string;
  published: boolean;
  reviewHandlerEmail: string;
  slug: string;
  state?: ProductStates;
};

export type ProductStates = 'pending' | 'active' | 'notActive';
