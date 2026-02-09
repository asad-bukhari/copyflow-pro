import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/20",
  completed: "bg-success/15 text-success border-success/30 hover:bg-success/20",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}
