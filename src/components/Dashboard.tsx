import { useState } from "react";
import { Lock, TrendingUp, Clock, CheckCircle, Plus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFHELockClaims, useSubmitClaim, useFHEEncryption } from "@/hooks/useContract";
import ClaimCard from "./ClaimCard";
import NewClaimForm from "./NewClaimForm";

const Dashboard = () => {
  const { isConnected } = useFHELockClaims();
  const { submitEncryptedClaim, isLoading: isSubmitting } = useSubmitClaim();
  const { encryptData, isEncrypting } = useFHEEncryption();
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const mockClaims = [
    {
      claimId: "CLM-2024-001",
      status: "encrypted" as const,
      claimType: "Auto Collision Damage",
      submittedDate: "Mar 15, 2024"
    },
    {
      claimId: "CLM-2024-002", 
      status: "pending" as const,
      claimType: "Property Water Damage",
      submittedDate: "Mar 12, 2024"
    },
    {
      claimId: "CLM-2024-003",
      status: "settled" as const,
      claimType: "Personal Injury",
      submittedDate: "Mar 8, 2024",
      encryptedAmount: false
    }
  ];

  const stats = [
    {
      title: "Total Claims",
      value: "8",
      icon: FileText,
      change: "+2 this month"
    },
    {
      title: "Encrypted Claims",
      value: "5",
      icon: Lock,
      change: "FHE protected"
    },
    {
      title: "Settled Claims",
      value: "3",
      icon: CheckCircle,
      change: "Successfully processed"
    },
    {
      title: "Protected Value",
      value: "$127K",
      icon: TrendingUp,
      change: "FHE secured"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Claims Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-foreground">Encrypted Claims</h2>
          </div>
          {isConnected && (
            <Button 
              className="flex items-center space-x-2"
              onClick={() => setShowNewClaimForm(true)}
              disabled={isSubmitting || isEncrypting}
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting || isEncrypting ? 'Processing...' : 'New Claim'}</span>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClaims.map((claim) => (
            <ClaimCard key={claim.claimId} {...claim} />
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-blue-600">FHE Encryption Active</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your sensitive claim data is protected using Fully Homomorphic Encryption (FHE). 
            Financial amounts and personal information remain encrypted during all processing, 
            ensuring maximum privacy and security throughout the claims lifecycle.
          </p>
        </CardContent>
      </Card>

      {/* New Claim Form Modal */}
      {showNewClaimForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <NewClaimForm onClose={() => setShowNewClaimForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;