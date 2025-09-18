// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract FHELockClaims is SepoliaConfig {
    using FHE for *;
    
    struct InsuranceClaim {
        euint32 claimId;
        euint32 claimAmount;
        euint32 policyNumber;
        euint32 claimType;
        euint32 status; // 0: Pending, 1: Approved, 2: Rejected, 3: Under Review
        euint32 priority; // 1: Low, 2: Medium, 3: High, 4: Critical
        bool isActive;
        bool isVerified;
        string claimDescription;
        string supportingDocuments;
        address claimant;
        address insurer;
        uint256 submissionTime;
        uint256 lastUpdated;
    }
    
    struct ClaimDocument {
        euint32 documentId;
        euint32 claimId;
        string documentHash;
        string documentType;
        bool isVerified;
        address uploader;
        uint256 uploadTime;
    }
    
    struct ClaimReview {
        euint32 reviewId;
        euint32 claimId;
        euint32 reviewerScore;
        euint32 riskLevel;
        bool isApproved;
        string reviewNotes;
        address reviewer;
        uint256 reviewTime;
    }
    
    mapping(uint256 => InsuranceClaim) public claims;
    mapping(uint256 => ClaimDocument) public documents;
    mapping(uint256 => ClaimReview) public reviews;
    mapping(address => euint32) public userReputation;
    mapping(address => euint32) public insurerReputation;
    mapping(address => euint32) public reviewerReputation;
    
    uint256 public claimCounter;
    uint256 public documentCounter;
    uint256 public reviewCounter;
    
    address public owner;
    address public verifier;
    address public treasury;
    
    event ClaimSubmitted(uint256 indexed claimId, address indexed claimant, string description);
    event ClaimReviewed(uint256 indexed claimId, address indexed reviewer, bool approved);
    event ClaimApproved(uint256 indexed claimId, uint32 amount);
    event ClaimRejected(uint256 indexed claimId, string reason);
    event DocumentUploaded(uint256 indexed documentId, uint256 indexed claimId, string documentType);
    event ReputationUpdated(address indexed user, uint32 reputation);
    
    constructor(address _verifier, address _treasury) {
        owner = msg.sender;
        verifier = _verifier;
        treasury = _treasury;
    }
    
    function submitClaim(
        string memory _description,
        externalEuint32 _claimAmount,
        externalEuint32 _policyNumber,
        externalEuint32 _claimType,
        externalEuint32 _priority,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(bytes(_description).length > 0, "Claim description cannot be empty");
        
        uint256 claimId = claimCounter++;
        
        // Convert external encrypted values to internal encrypted values
        euint32 internalAmount = FHE.fromExternal(_claimAmount, inputProof);
        euint32 internalPolicyNumber = FHE.fromExternal(_policyNumber, inputProof);
        euint32 internalClaimType = FHE.fromExternal(_claimType, inputProof);
        euint32 internalPriority = FHE.fromExternal(_priority, inputProof);
        
        claims[claimId] = InsuranceClaim({
            claimId: FHE.asEuint32(0), // Will be set properly later
            claimAmount: internalAmount,
            policyNumber: internalPolicyNumber,
            claimType: internalClaimType,
            status: FHE.asEuint32(0), // Pending
            priority: internalPriority,
            isActive: true,
            isVerified: false,
            claimDescription: _description,
            supportingDocuments: "",
            claimant: msg.sender,
            insurer: address(0), // Will be assigned by verifier
            submissionTime: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        emit ClaimSubmitted(claimId, msg.sender, _description);
        return claimId;
    }
    
    function uploadDocument(
        uint256 _claimId,
        string memory _documentHash,
        string memory _documentType
    ) public returns (uint256) {
        require(claims[_claimId].claimant != address(0), "Claim does not exist");
        require(claims[_claimId].claimant == msg.sender || msg.sender == verifier, "Unauthorized");
        
        uint256 documentId = documentCounter++;
        
        documents[documentId] = ClaimDocument({
            documentId: FHE.asEuint32(0), // Will be set properly later
            claimId: FHE.asEuint32(_claimId),
            documentHash: _documentHash,
            documentType: _documentType,
            isVerified: false,
            uploader: msg.sender,
            uploadTime: block.timestamp
        });
        
        emit DocumentUploaded(documentId, _claimId, _documentType);
        return documentId;
    }
    
    function reviewClaim(
        uint256 _claimId,
        externalEuint32 _reviewerScore,
        externalEuint32 _riskLevel,
        bool _isApproved,
        string memory _reviewNotes,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(msg.sender == verifier, "Only verifier can review claims");
        require(claims[_claimId].claimant != address(0), "Claim does not exist");
        require(claims[_claimId].isActive, "Claim is not active");
        
        uint256 reviewId = reviewCounter++;
        
        // Convert external encrypted values to internal encrypted values
        euint32 internalScore = FHE.fromExternal(_reviewerScore, inputProof);
        euint32 internalRiskLevel = FHE.fromExternal(_riskLevel, inputProof);
        
        reviews[reviewId] = ClaimReview({
            reviewId: FHE.asEuint32(0), // Will be set properly later
            claimId: FHE.asEuint32(_claimId),
            reviewerScore: internalScore,
            riskLevel: internalRiskLevel,
            isApproved: _isApproved,
            reviewNotes: _reviewNotes,
            reviewer: msg.sender,
            reviewTime: block.timestamp
        });
        
        // Update claim status based on review
        if (_isApproved) {
            claims[_claimId].status = FHE.asEuint32(1); // Approved
            claims[_claimId].isVerified = true;
            emit ClaimApproved(_claimId, 0); // Amount will be decrypted off-chain
        } else {
            claims[_claimId].status = FHE.asEuint32(2); // Rejected
            emit ClaimRejected(_claimId, _reviewNotes);
        }
        
        claims[_claimId].lastUpdated = block.timestamp;
        emit ClaimReviewed(_claimId, msg.sender, _isApproved);
        return reviewId;
    }
    
    function updateClaimStatus(
        uint256 _claimId,
        uint32 _newStatus
    ) public {
        require(msg.sender == verifier, "Only verifier can update status");
        require(claims[_claimId].claimant != address(0), "Claim does not exist");
        require(_newStatus <= 3, "Invalid status");
        
        claims[_claimId].status = FHE.asEuint32(_newStatus);
        claims[_claimId].lastUpdated = block.timestamp;
    }
    
    function assignInsurer(
        uint256 _claimId,
        address _insurer
    ) public {
        require(msg.sender == verifier, "Only verifier can assign insurer");
        require(claims[_claimId].claimant != address(0), "Claim does not exist");
        require(_insurer != address(0), "Invalid insurer address");
        
        claims[_claimId].insurer = _insurer;
        claims[_claimId].lastUpdated = block.timestamp;
    }
    
    function updateReputation(
        address _user,
        euint32 _reputation,
        uint8 _userType // 0: Claimant, 1: Insurer, 2: Reviewer
    ) public {
        require(msg.sender == verifier, "Only verifier can update reputation");
        require(_user != address(0), "Invalid user address");
        
        if (_userType == 0) {
            userReputation[_user] = _reputation;
        } else if (_userType == 1) {
            insurerReputation[_user] = _reputation;
        } else if (_userType == 2) {
            reviewerReputation[_user] = _reputation;
        }
        
        emit ReputationUpdated(_user, 0); // FHE.decrypt(_reputation) - will be decrypted off-chain
    }
    
    function getClaimInfo(uint256 _claimId) public view returns (
        string memory description,
        uint8 amount,
        uint8 policyNumber,
        uint8 claimType,
        uint8 status,
        uint8 priority,
        bool isActive,
        bool isVerified,
        address claimant,
        address insurer,
        uint256 submissionTime,
        uint256 lastUpdated
    ) {
        InsuranceClaim storage claim = claims[_claimId];
        return (
            claim.claimDescription,
            0, // FHE.decrypt(claim.claimAmount) - will be decrypted off-chain
            0, // FHE.decrypt(claim.policyNumber) - will be decrypted off-chain
            0, // FHE.decrypt(claim.claimType) - will be decrypted off-chain
            0, // FHE.decrypt(claim.status) - will be decrypted off-chain
            0, // FHE.decrypt(claim.priority) - will be decrypted off-chain
            claim.isActive,
            claim.isVerified,
            claim.claimant,
            claim.insurer,
            claim.submissionTime,
            claim.lastUpdated
        );
    }
    
    function getDocumentInfo(uint256 _documentId) public view returns (
        uint8 claimId,
        string memory documentHash,
        string memory documentType,
        bool isVerified,
        address uploader,
        uint256 uploadTime
    ) {
        ClaimDocument storage document = documents[_documentId];
        return (
            0, // FHE.decrypt(document.claimId) - will be decrypted off-chain
            document.documentHash,
            document.documentType,
            document.isVerified,
            document.uploader,
            document.uploadTime
        );
    }
    
    function getReviewInfo(uint256 _reviewId) public view returns (
        uint8 claimId,
        uint8 reviewerScore,
        uint8 riskLevel,
        bool isApproved,
        string memory reviewNotes,
        address reviewer,
        uint256 reviewTime
    ) {
        ClaimReview storage review = reviews[_reviewId];
        return (
            0, // FHE.decrypt(review.claimId) - will be decrypted off-chain
            0, // FHE.decrypt(review.reviewerScore) - will be decrypted off-chain
            0, // FHE.decrypt(review.riskLevel) - will be decrypted off-chain
            review.isApproved,
            review.reviewNotes,
            review.reviewer,
            review.reviewTime
        );
    }
    
    function getUserReputation(address _user) public view returns (uint8) {
        return 0; // FHE.decrypt(userReputation[_user]) - will be decrypted off-chain
    }
    
    function getInsurerReputation(address _insurer) public view returns (uint8) {
        return 0; // FHE.decrypt(insurerReputation[_insurer]) - will be decrypted off-chain
    }
    
    function getReviewerReputation(address _reviewer) public view returns (uint8) {
        return 0; // FHE.decrypt(reviewerReputation[_reviewer]) - will be decrypted off-chain
    }
    
    function withdrawFunds(uint256 _claimId) public {
        require(claims[_claimId].claimant == msg.sender, "Only claimant can withdraw");
        require(claims[_claimId].isVerified, "Claim must be verified");
        require(claims[_claimId].status == FHE.asEuint32(1), "Claim must be approved");
        
        // Transfer funds to claimant
        // Note: In a real implementation, funds would be transferred based on decrypted amount
        claims[_claimId].isActive = false;
        
        // For now, we'll transfer a placeholder amount
        // payable(msg.sender).transfer(amount);
    }
    
    function emergencyPause() public {
        require(msg.sender == owner, "Only owner can pause");
        // Implementation for emergency pause functionality
    }
    
    function emergencyUnpause() public {
        require(msg.sender == owner, "Only owner can unpause");
        // Implementation for emergency unpause functionality
    }
}
