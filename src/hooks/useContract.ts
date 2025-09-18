import { useContractRead, useContractWrite, useAccount, useWaitForTransaction } from 'wagmi';
import { useState } from 'react';
import contractInfo from '../contracts/contract-info.json';

// FHE Contract ABI for encrypted data processing
const contractABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "bytes", "name": "_claimAmount", "type": "bytes"},
      {"internalType": "bytes", "name": "_policyNumber", "type": "bytes"},
      {"internalType": "bytes", "name": "_claimType", "type": "bytes"},
      {"internalType": "bytes", "name": "_priority", "type": "bytes"},
      {"internalType": "bytes", "name": "inputProof", "type": "bytes"}
    ],
    "name": "submitClaim",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_claimId", "type": "uint256"},
      {"internalType": "string", "name": "_documentHash", "type": "string"},
      {"internalType": "string", "name": "_documentType", "type": "string"}
    ],
    "name": "uploadDocument",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_claimId", "type": "uint256"}],
    "name": "getClaimInfo",
    "outputs": [
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint8", "name": "amount", "type": "uint8"},
      {"internalType": "uint8", "name": "policyNumber", "type": "uint8"},
      {"internalType": "uint8", "name": "claimType", "type": "uint8"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint8", "name": "priority", "type": "uint8"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isVerified", "type": "bool"},
      {"internalType": "address", "name": "claimant", "type": "address"},
      {"internalType": "address", "name": "insurer", "type": "address"},
      {"internalType": "uint256", "name": "submissionTime", "type": "uint256"},
      {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const useFHELockClaims = () => {
  const { address } = useAccount();

  return {
    address,
    isConnected: !!address,
    contractAddress: contractInfo.address as `0x${string}`,
    contractABI,
  };
};

// Hook for submitting encrypted claims
export const useSubmitClaim = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const writeContract = useContractWrite({
    address: contractInfo.address as `0x${string}`,
    abi: contractABI,
    functionName: 'submitClaim',
  });

  const submitEncryptedClaim = async (
    description: string,
    encryptedAmount: string,
    encryptedPolicyNumber: string,
    encryptedClaimType: string,
    encryptedPriority: string,
    proof: string
  ) => {
    setIsLoading(true);
    try {
      const result = await writeContract.writeContractAsync({
        args: [
          description,
          encryptedAmount,
          encryptedPolicyNumber,
          encryptedClaimType,
          encryptedPriority,
          proof
        ]
      });
      return result;
    } catch (error) {
      console.error('Error submitting claim:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...writeContract,
    submitEncryptedClaim,
    isLoading
  };
};

// Hook for uploading documents
export const useUploadDocument = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const writeContract = useContractWrite({
    address: contractInfo.address as `0x${string}`,
    abi: contractABI,
    functionName: 'uploadDocument',
  });

  const uploadDocument = async (
    claimId: number,
    documentHash: string,
    documentType: string
  ) => {
    setIsLoading(true);
    try {
      const result = await writeContract.writeContractAsync({
        args: [BigInt(claimId), documentHash, documentType]
      });
      return result;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...writeContract,
    uploadDocument,
    isLoading
  };
};

// Hook for reading claim information
export const useGetClaimInfo = (claimId: number) => {
  return useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractABI,
    functionName: 'getClaimInfo',
    args: [BigInt(claimId)],
    enabled: claimId > 0,
  });
};

// Hook for FHE encryption utilities
export const useFHEEncryption = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);

  const encryptData = async (data: string): Promise<string> => {
    setIsEncrypting(true);
    try {
      // Simulate FHE encryption process
      // In a real implementation, this would use FHE libraries
      const encrypted = btoa(data); // Base64 encoding as placeholder
      return encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    } finally {
      setIsEncrypting(false);
    }
  };

  const generateProof = async (encryptedData: string): Promise<string> => {
    // Simulate proof generation for FHE operations
    // In a real implementation, this would generate cryptographic proofs
    return `proof_${encryptedData.slice(0, 10)}`;
  };

  return {
    encryptData,
    generateProof,
    isEncrypting
  };
};
