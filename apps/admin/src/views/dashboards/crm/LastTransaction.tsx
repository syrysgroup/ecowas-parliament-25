import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

type Status = "verified" | "rejected" | "pending" | "on-hold";

const statusColors: Record<Status, string> = {
  verified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "on-hold": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

const data = [
  { date: "Feb 06, 2024", cardType: "Credit Card", cardNumber: "5634", trend: "⬆", imgName: "visa", status: "verified" as Status, amount: "+$1,678.09" },
  { date: "Feb 07, 2024", cardType: "Debit Card", cardNumber: "3689", trend: "⬇", imgName: "mastercard", status: "rejected" as Status, amount: "-$1,432.56" },
  { date: "Feb 09, 2024", cardType: "Credit Card", cardNumber: "5896", trend: "⬆", imgName: "visa", status: "pending" as Status, amount: "+$2,456.78" },
  { date: "Feb 11, 2024", cardType: "Credit Card", cardNumber: "5659", trend: "⬆", imgName: "mastercard", status: "verified" as Status, amount: "+$3,200.00" },
  { date: "Feb 13, 2024", cardType: "Debit Card", cardNumber: "8526", trend: "⬇", imgName: "visa", status: "on-hold" as Status, amount: "-$900.00" },
];

const LastTransaction = () => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between pb-2">
      <div>
        <p className="font-semibold text-card-foreground">Last Transaction</p>
        <p className="text-xs text-muted-foreground">Recent payment activities</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Today</DropdownMenuItem>
          <DropdownMenuItem>Last Week</DropdownMenuItem>
          <DropdownMenuItem>Last Month</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Card</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">{row.date}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{row.imgName === "visa" ? "💳" : "💰"}</span>
                    <div>
                      <p className="text-xs font-medium text-card-foreground">{row.cardType}</p>
                      <p className="text-[10px] text-muted-foreground">**** {row.cardNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className={`px-6 py-3 text-xs font-medium text-right whitespace-nowrap ${row.amount.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                  {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export default LastTransaction;
