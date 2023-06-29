type ProofOfSpace =
  | string
  | {
      challenge: string;
      publicPoolKey: string;
      poolContractPuzzleHash: string;
      localPublicKey: string;
      size: number;
      proof: string;
      farmerPublicKey: string;
    };

export default ProofOfSpace;
