import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Shield, FileText, Calendar, DollarSign, User, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFHELockClaims, useGetClaimInfo } from "@/hooks/useContract";

const ClaimDetails = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const { isConnected } = useFHELockClaims();
  const [showDecryptedData, setShowDecryptedData] = useState(false);

  // Mock data - in real app, this would come from the contract
  const claimData = {
    claimId: claimId || "CLM-2024-001",
    status: "encrypted" as const,
    claimType: "Auto Collision Damage",
    description: "Vehicle collision occurred on Highway 101 during rush hour traffic. Front bumper and headlight assembly damaged. No injuries reported.",
    amount: "$12,450",
    policyNumber: "POL-2024-789456",
    priority: "High",
    submittedDate: "March 15, 2024",
    lastUpdated: "March 16, 2024",
    claimant: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    insurer: "0x8ba1f109551bD432803012645Hac136c",
    isVerified: true,
    documents: [
      {
        id: "DOC-001",
        name: "Police Report",
        type: "Police Report",
        uploadDate: "March 15, 2024",
        size: "2.3 MB"
      },
      {
        id: "DOC-002", 
        name: "Damage Photos",
        type: "Images",
        uploadDate: "March 15, 2024",
        size: "5.7 MB"
      },
      {
        id: "DOC-003",
        name: "Insurance Card",
        type: "Policy Document",
        uploadDate: "March 15, 2024",
        size: "1.2 MB"
      }
    ],
    timeline: [
      {
        date: "March 15, 2024",
        time: "2:30 PM",
        action: "Claim Submitted",
        description: "Initial claim submitted with encrypted data",
        status: "completed"
      },
      {
        date: "March 15, 2024", 
        time: "3:45 PM",
        action: "Documents Uploaded",
        description: "Supporting documents uploaded and verified",
        status: "completed"
      },
      {
        date: "March 16, 2024",
        time: "9:15 AM", 
        action: "Under Review",
        description: "Claim is being reviewed by insurance adjuster",
        status: "in-progress"
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "encrypted":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "settled":
        return "bg-green-500/10 text-green-700 border-green-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "encrypted":
        return <Shield className="w-4 h-4" />;
      case "pending":
        return <Calendar className="w-4 h-4" />;
      case "settled":
        return <DollarSign className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Claim Details</h1>
              <p className="text-muted-foreground">#{claimData.claimId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`${getStatusColor(claimData.status)} flex items-center space-x-1`}
            >
              {getStatusIcon(claimData.status)}
              <span className="capitalize">{claimData.status}</span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Claim Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Claim Type</label>
                    <p className="text-lg font-semibold">{claimData.claimType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <p className="text-lg font-semibold">{claimData.priority}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm leading-relaxed">{claimData.description}</p>
                </div>

                <Separator />

                {/* FHE Encrypted Data Section */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">FHE Encrypted Data</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDecryptedData(!showDecryptedData)}
                      className="flex items-center space-x-1"
                    >
                      {showDecryptedData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showDecryptedData ? 'Hide' : 'Show'} Decrypted</span>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Claim Amount</label>
                      {showDecryptedData ? (
                        <p className="text-lg font-bold text-green-600">{claimData.amount}</p>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                          <span className="text-sm text-muted-foreground">Encrypted</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Policy Number</label>
                      {showDecryptedData ? (
                        <p className="text-lg font-semibold">{claimData.policyNumber}</p>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                          <span className="text-sm text-muted-foreground">Encrypted</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                    Data is encrypted using Fully Homomorphic Encryption (FHE) and remains secure throughout processing.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Supporting Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {claimData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size} • {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">FHE Protected</h3>
                  <p className="text-sm text-muted-foreground">
                    Your claim data is encrypted and secure
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Submitted:</span>
                    <span>{claimData.submittedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Updated:</span>
                    <span>{claimData.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Verified:</span>
                    <span className="text-green-600">{claimData.isVerified ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claimData.timeline.map((event, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          event.status === 'completed' ? 'bg-green-500' : 
                          event.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        {index < claimData.timeline.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm">{event.action}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.date} at {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetails;
