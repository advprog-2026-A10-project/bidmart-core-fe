import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "~/shared/components/ui/table";
import { Badge } from "~/shared/components/ui/badge";

const invoices = [
  { id: "INV-001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { id: "INV-002", status: "Pending", method: "Bank Transfer", amount: "$150.00" },
  { id: "INV-003", status: "Unpaid", method: "PayPal", amount: "$350.00" },
  { id: "INV-004", status: "Paid", method: "Credit Card", amount: "$450.00" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Paid: "default",
  Pending: "secondary",
  Unpaid: "destructive",
};

export function TableSection() {
  const total = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.amount.replace("$", "")),
    0,
  );

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Table</h2>

      <Table>
        <TableCaption>A list of recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-medium">{inv.id}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
              </TableCell>
              <TableCell>{inv.method}</TableCell>
              <TableCell className="text-right">{inv.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">${total.toFixed(2)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </section>
  );
}
