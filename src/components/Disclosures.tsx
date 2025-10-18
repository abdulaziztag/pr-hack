import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertCircle } from "lucide-react";

export function ProductionDisclosure() {
  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4" aria-hidden="true" />
          What would be regulated in production?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Identity verification (KYC/AML) and ongoing monitoring</li>
          <li>• Source of funds documentation</li>
          <li>• Affordability checks and credit reporting</li>
          <li>• Regulatory disclosures and complaint procedures</li>
          <li>• Tax reporting and withholding</li>
        </ul>
      </CardContent>
    </Card>
  );
}

export function DemoLimitationsDisclosure() {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          What we DO NOT do in this demo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• No real money movement or bank connectivity</li>
          <li>• No data storage outside your browser</li>
          <li>• No tracking or third-party sharing</li>
          <li>• No actual lending decisions or credit checks</li>
          <li>• No customer support or dispute resolution</li>
        </ul>
      </CardContent>
    </Card>
  );
}

