"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Product = {
    _id: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    district: string;
    farmerId?: { name?: string; phone?: string; district?: string };
};

type Order = {
    _id: string;
    quantity: number;
    totalPrice: number;
    status: string;
    productId?: { name?: string };
    farmerId?: { name?: string; phone?: string };
    transporterId?: { name?: string; phone?: string; carPlateNumber?: string };
};

type MeResponse = {
    user?: { role?: "farmer" | "wholesaler" | "transporter" };
};

export default function WholesalerDashboard() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [quantities, setQuantities] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadData() {
        const me = await fetch("/api/auth/me");
        if (!me.ok) {
            router.push("/login");
            return;
        }

        const meData = (await me.json()) as MeResponse;
        if (meData.user?.role !== "wholesaler") {
            router.push("/login");
            return;
        }

        const productsRes = await fetch("/api/products");
        const ordersRes = await fetch("/api/orders");

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        setProducts(productsData.products || []);
        setOrders(ordersData.orders || []);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function placeOrder(productId: string) {
        setError("");
        const quantity = Number(quantities[productId] || 0);
        if (quantity <= 0) {
            setError("Enter a valid quantity");
            return;
        }

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Failed to place order");
            return;
        }

        setQuantities((prev) => ({ ...prev, [productId]: "" }));
        loadData();
    }

    async function completeOrder(orderId: string) {
        setError("");
        const res = await fetch("/api/orders/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Failed to complete order");
            return;
        }

        loadData();
    }

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    if (loading) {
        return <main className="p-6">Loading wholesaler dashboard...</main>;
    }

    return (
        <main className="mx-auto w-full max-w-7xl space-y-6 bg-background p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Wholesaler Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Browse farmer listings and place orders.</p>
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
                    <CardTitle>Browse Products</CardTitle>
                    <CardDescription>Choose quantity and create an order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>District</TableHead>
                                <TableHead>Farmer</TableHead>
                                <TableHead>Order Qty</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground">
                                        No products available.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.quantity} {product.unit}</TableCell>
                                    <TableCell>${product.price}</TableCell>
                                    <TableCell>{product.district}</TableCell>
                                    <TableCell>{product.farmerId?.name || "N/A"}</TableCell>
                                    <TableCell>
                                        <Input
                                            className="w-28"
                                            placeholder="Qty"
                                            value={quantities[product._id] || ""}
                                            onChange={(e) =>
                                                setQuantities((prev) => ({ ...prev, [product._id]: e.target.value }))
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => placeOrder(product._id)}>
                                            Place Order
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Farmer</TableHead>
                                <TableHead>Transporter</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground">
                                        No orders yet.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell>{order.productId?.name || "Product"}</TableCell>
                                    <TableCell>{order.quantity}</TableCell>
                                    <TableCell>${order.totalPrice}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{order.status}</Badge>
                                    </TableCell>
                                    <TableCell>{order.farmerId?.name || "N/A"}</TableCell>
                                    <TableCell>{order.transporterId?.name || "Not assigned"}</TableCell>
                                    <TableCell className="text-right">
                                        {order.status === "in_delivery" ? (
                                            <Button size="sm" variant="secondary" onClick={() => completeOrder(order._id)}>
                                                Mark Completed
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
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
