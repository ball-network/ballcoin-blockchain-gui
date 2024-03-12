type OfferBuilderData = {
  offered: {
    ball: {
      amount: string;
    }[];
    tokens: {
      amount: string;
      assetId: string;
      crCat?: {
        flags: string[];
        authorizedProviders: string[];
      };
    }[];
    nfts: {
      nftId: string;
    }[];
    fee: {
      amount: string;
    }[];
  };
  requested: {
    ball: {
      amount: string;
    }[];
    tokens: {
      amount: string;
      assetId: string;
      crCat?: {
        flags: string[];
        authorizedProviders: string[];
      };
    }[];
    nfts: {
      nftId: string;
    }[];
    fee: {
      amount: string;
    }[];
  };
};

export default OfferBuilderData;
