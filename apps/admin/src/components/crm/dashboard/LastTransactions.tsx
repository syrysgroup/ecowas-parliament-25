import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const transactions = [
  { id: "#5089", type: "Sponsorship", amount: "$12,500", status: "Paid", statusClass: "bg-emerald-500/10 text-emerald-600 border-0" },
  { id: "#5090", type: "Event Registration", amount: "$350", status: "Pending", statusClass: "bg-amber-500/10 text-amber-600 border-0" },
  { id: "#5091", type: "Donation", amount: "$2,800", status: "Paid", statusClass: "bg-emerald-500/10 text-emerald-600 border-0" },
  { id: "#5092", type: "Sponsorship", amount: "$8,000", status: "Overdue", statusClass: "bg-destructive/10 text-destructive border-0" },
  { id: "#5093", type: "Event Registration", amount: "$175", status: "Paid", statusClass: "bg-emerald-500/10 text-emerald-600 border-0" },
];

export default function LastTransactions() {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Last Transactions</CardTitle>
        <p className="text-xs text-muted-foreground">Recent financial activity</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t.type}</p>
                <p className="text-[11px] text-muted-foreground">{t.id}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{t.amount}</span>
              <Badge variant="secondary" className={`${t.statusClass} text-[10px]`}>
                {t.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
