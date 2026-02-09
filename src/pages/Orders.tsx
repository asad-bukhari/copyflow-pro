import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, Download, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";
import { mockApi } from "@/services/mock-data";
import type { Order, OrderStatus, PaymentMethod, CreateOrderPayload } from "@/types";

interface LineItemRow {
  service_id: string;
  quantity: number;
  unit_price: number;
}

export default function Orders() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // Order form state
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItemRow[]>([{ service_id: "", quantity: 1, unit_price: 0 }]);

  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: () => mockApi.getOrders() });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => mockApi.getServices() });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => mockApi.getCustomers() });

  const createMut = useMutation({
    mutationFn: (d: CreateOrderPayload) => mockApi.createOrder(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Order created");
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => mockApi.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Status updated");
    },
  });

  const activeServices = services.filter((s) => s.is_active);

  const resetForm = () => {
    setCustomerId("");
    setPaymentMethod("cash");
    setNotes("");
    setItems([{ service_id: "", quantity: 1, unit_price: 0 }]);
  };

  const handleCreateOpen = () => { resetForm(); setCreateOpen(true); };

  const updateItem = (index: number, field: keyof LineItemRow, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      // Auto-fill price when service changes
      if (field === "service_id") {
        const svc = activeServices.find((s) => s.id === value);
        if (svc) next[index].unit_price = svc.price;
      }
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { service_id: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const orderTotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);

  const handleCreate = async () => {
    if (!customerId) { toast.error("Select a customer"); return; }
    const validItems = items.filter((it) => it.service_id && it.quantity > 0);
    if (validItems.length === 0) { toast.error("Add at least one item"); return; }
    await createMut.mutateAsync({ customer_id: customerId, items: validItems, payment_method: paymentMethod, notes });
    setCreateOpen(false);
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage sales and invoices</p>
        </div>
        <Button onClick={handleCreateOpen}>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
              ) : (
                filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.invoice_no}</TableCell>
                    <TableCell>{o.customer_name}</TableCell>
                    <TableCell className="text-right">${o.total.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {format(new Date(o.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setDetailOrder(o)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {o.status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" className="text-success text-xs"
                              onClick={() => statusMut.mutate({ id: o.id, status: "completed" })}>
                              Complete
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive text-xs"
                              onClick={() => statusMut.mutate({ id: o.id, status: "cancelled" })}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Add line items and submit the order.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer…" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-semibold">Line Items</Label>
              <div className="mt-3 space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      {i === 0 && <Label className="text-xs text-muted-foreground">Service</Label>}
                      <Select value={item.service_id} onValueChange={(v) => updateItem(i, "service_id", v)}>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {activeServices.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name} — ${s.price.toFixed(2)}/{s.unit_type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                      <Input type="number" min={1} value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <Label className="text-xs text-muted-foreground">Price</Label>}
                      <Input type="number" step="0.01" value={item.unit_price}
                        onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-2 text-right font-medium text-sm pt-2">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                    <div className="col-span-1">
                      {items.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}>
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={addItem}>
                <Plus className="mr-1 h-3 w-3" /> Add Item
              </Button>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">${orderTotal.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>{detailOrder?.invoice_no}</DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer</span>
                  <p className="font-medium">{detailOrder.customer_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-0.5"><StatusBadge status={detailOrder.status} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment</span>
                  <p className="font-medium capitalize">{detailOrder.payment_method}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium">{format(new Date(detailOrder.created_at), "MMM dd, yyyy HH:mm")}</p>
                </div>
              </div>

              <Separator />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailOrder.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>{it.service_name}</TableCell>
                      <TableCell className="text-right">{it.quantity}</TableCell>
                      <TableCell className="text-right">${it.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${it.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">${detailOrder.total.toFixed(2)}</span>
              </div>

              {detailOrder.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Notes</span>
                  <p className="text-sm mt-1">{detailOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => toast.info("PDF download requires backend connection")}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
