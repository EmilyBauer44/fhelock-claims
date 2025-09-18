import { useState } from "react";
import { Lock, Upload, FileText, DollarSign, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFHELockClaims, useSubmitClaim, useFHEEncryption } from "@/hooks/useContract";
import { toast } from "sonner";

interface NewClaimFormProps {
  onClose: () => void;
}

const NewClaimForm = ({ onClose }: NewClaimFormProps) => {
  const { isConnected } = useFHELockClaims();
  const { submitEncryptedClaim, isLoading: isSubmitting } = useSubmitClaim();
  const { encryptData, generateProof, isEncrypting } = useFHEEncryption();

  const [formData, setFormData] = useState({
    claimType: "",
    description: "",
    amount: "",
    policyNumber: "",
    priority: "medium",
    documents: [] as File[]
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const claimTypes = [
    { value: "auto", label: "Auto Insurance" },
    { value: "property", label: "Property Damage" },
    { value: "health", label: "Health Insurance" },
    { value: "life", label: "Life Insurance" },
    { value: "travel", label: "Travel Insurance" },
    { value: "other", label: "Other" }
  ];

  const priorities = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
    { value: "urgent", label: "Urgent" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Encrypt sensitive data
      const encryptedAmount = await encryptData(formData.amount);
      const encryptedPolicyNumber = await encryptData(formData.policyNumber);
      const encryptedClaimType = await encryptData(formData.claimType);
      const encryptedPriority = await encryptData(formData.priority);
      
      // Generate proof for FHE operations
      const proof = await generateProof(encryptedAmount);
      
      // Submit encrypted claim to contract
      await submitEncryptedClaim(
        formData.description,
        encryptedAmount,
        encryptedPolicyNumber,
        encryptedClaimType,
        encryptedPriority,
        proof
      );

      toast.success("Claim submitted successfully! Your data is encrypted and secure.");
      onClose();
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Wallet Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Please connect your wallet to submit a new claim. Your wallet is required for secure data encryption and blockchain submission.
          </p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-blue-600" />
          <span>Submit New Claim</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          All sensitive data will be encrypted using FHE before submission
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Claim Type */}
          <div className="space-y-2">
            <Label htmlFor="claimType">Claim Type *</Label>
            <Select value={formData.claimType} onValueChange={(value) => handleInputChange("claimType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select claim type" />
              </SelectTrigger>
              <SelectContent>
                {claimTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your claim in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              rows={4}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Claim Amount (USD) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Amount will be encrypted using FHE
            </p>
          </div>

          {/* Policy Number */}
          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number *</Label>
            <Input
              id="policyNumber"
              placeholder="Enter your policy number"
              value={formData.policyNumber}
              onChange={(e) => handleInputChange("policyNumber", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Policy number will be encrypted using FHE
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label>Supporting Documents</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Upload documents</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, PNG up to 10MB each
                  </p>
                </div>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="w-auto"
                />
              </div>
              {formData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded files:</p>
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FHE Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  FHE Encryption Active
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Your claim amount, policy number, and priority will be encrypted using Fully Homomorphic Encryption. 
                  This data remains encrypted throughout the entire claims process.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || isSubmitting || isEncrypting}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Lock className="w-4 h-4 mr-2 animate-spin" />
                  Encrypting & Submitting...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Submit Encrypted Claim
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewClaimForm;
