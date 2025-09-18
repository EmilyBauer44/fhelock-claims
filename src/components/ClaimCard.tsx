import { Shield, Eye, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ClaimCardProps {
  claimId: string;
  status: "pending" | "encrypted" | "settled";
  claimType: string;
  submittedDate: string;
  encryptedAmount?: boolean;
}

const ClaimCard = ({ 
  claimId, 
  status, 
  claimType, 
  submittedDate, 
  encryptedAmount = true 
}: ClaimCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "encrypted":
        return "bg-accent/10 text-accent border-accent/20";
      case "settled":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "encrypted":
        return <Shield className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "settled":
        return <DollarSign className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(status)}`}
            >
              {getStatusIcon(status)}
              <span className="ml-1 capitalize">{status}</span>
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            #{claimId}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold text-foreground">{claimType}</p>
          <p className="text-sm text-muted-foreground">
            Submitted: {submittedDate}
          </p>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">
              {encryptedAmount ? "Amount Encrypted" : "Amount Visible"}
            </span>
          </div>
          {encryptedAmount ? (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
            </div>
          ) : (
            <span className="font-bold text-success">$12,450</span>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClaimCard;