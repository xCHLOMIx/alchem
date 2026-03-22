"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/ui/loader";

type Order = {
    _id: string;
    quantity: number;
    totalPrice: number;
    status: "pending" | "awaiting_transport" | "in_delivery" | "completed";
    productId?: { name?: string; district?: string; unit?: string };
    farmerId?: { name?: string; phone?: string; district?: string };
    wholesalerId?: { name?: string; phone?: string; companyName?: string };
};

type MeResponse = {
    user?: { role?: "farmer" | "wholesaler" | "transporter" };
};

export default function TransporterDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadData() {
        const me = await fetch("/api/auth/me");
        if (!me.ok) {
            router.push("/login");
            return;
        }

        const meData = (await me.json()) as MeResponse;
        if (meData.user?.role !== "transporter") {
            router.push("/login");
            return;
        }

        const ordersRes = await fetch("/api/orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function acceptOrder(orderId: string) {
        setError("");
        const res = await fetch("/api/orders/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Failed to accept order");
            return;
        }

        loadData();
    }

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background">
                <Loader />
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 bg-background p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Transporter Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Accept and complete deliveries.</p>
                </div>
                <Button variant="outline" onClick={logout}>Logout</Button>
            </div>

            {error ? (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <Card>
                <CardHeader>
                    <CardTitle>Available And Assigned Deliveries</CardTitle>
                    <CardDescription>Claim awaiting orders and move them into delivery.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Pickup</TableHead>
                                <TableHead>Dropoff</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground">
                                        No deliveries available.
                                    </TableCell>
                                </TableRow>
                            ) : null}

                            {orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell>{order.productId?.name || "Product"}</TableCell>
                                    <TableCell>{order.quantity} {order.productId?.unit || "units"}</TableCell>
                                    <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                                    <TableCell>{order.farmerId?.district || "N/A"}</TableCell>
                                    <TableCell>{order.wholesalerId?.companyName || order.wholesalerId?.name || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        {order.status === "awaiting_transport" ? (
                                            <Button size="sm" onClick={() => acceptOrder(order._id)}>
                                                Accept Delivery
                                            </Button>
                                        ) : null}

                                        {order.status === "completed" ? (
                                            <span className="text-xs text-muted-foreground">Completed</span>
                                        ) : null}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
