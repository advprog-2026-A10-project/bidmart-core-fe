import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { Badge } from "~/shared/components/ui/badge";
import { Link } from "react-router";

interface OrderTableProps {
  orders: Array<{
    id: string;
    buyerName?: string;
    sellerName?: string;
    listingTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  role: "seller" | "buyer";
}

export function OrderTable({ orders, role }: OrderTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "completed":
      case "shipped":
        return "default"; /// primary/black usually
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>{role === "seller" ? "Buyer" : "Seller"}</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{role === "seller" ? order.buyerName : order.sellerName}</TableCell>
              <TableCell>{order.listingTitle}</TableCell>
              <TableCell>{formatCurrency(order.amount)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
              </TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Link
                  to={`/${role === "seller" ? "seller/orders" : "orders"}/${order.id}`}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
