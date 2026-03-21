"use client";

import { FormEvent, useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
};

type Order = {
    _id: string;
    quantity: number;
    totalPrice: number;
    status: string;
    wholesalerId?: { name?: string; phone?: string; companyName?: string };
    productId?: { name?: string };
};

type MeResponse = {
    user?: { role?: "farmer" | "wholesaler" | "transporter" };
};

export default function FarmerDashboard() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("kg");
    const [price, setPrice] = useState("");
    const [district, setDistrict] = useState("");

    async function loadData() {
        const me = await fetch("/api/auth/me");
        if (!me.ok) {
            router.push("/login");
            return;
        }

        const meData = (await me.json()) as MeResponse;
        if (meData.user?.role !== "farmer") {
            router.push("/login");
            return;
        }

        const productsRes = await fetch("/api/products?mine=true");
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

    async function createProduct(e: FormEvent) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                quantity: Number(quantity),
                unit,
                price: Number(price),
                district,
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Failed to create product");
            return;
        }

        setName("");
        setQuantity("");
        setUnit("kg");
        setPrice("");
        setDistrict("");
        loadData();
    }

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    if (loading) {
        return <main className="p-6">Loading farmer dashboard...</main>;
    }

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 bg-background p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Farmer Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Post products and manage incoming orders.</p>
                </div>
                <Button variant="outline" onClick={logout}>Logout</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Product Listing</CardTitle>
                    <CardDescription>Add produce available for wholesalers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={createProduct} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Select value={unit} onValueChange={setUnit}>
                                    <SelectTrigger id="unit" className="w-full">
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="bags">bags</SelectItem>
                                        <SelectItem value="crates">crates</SelectItem>
                                        <SelectItem value="tons">tons</SelectItem>
                                        <SelectItem value="liters">liters</SelectItem>
                                        <SelectItem value="pieces">pieces</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="district">District</Label>
                                <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} />
                            </div>
                        </div>

                        {error ? (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : null}

                        <Button type="submit">Post Product</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>District</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground">
                                        No products yet.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                        {product.quantity} {product.unit}
                                    </TableCell>
                                    <TableCell>${product.price}</TableCell>
                                    <TableCell>{product.district}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Orders On My Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Buyer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground">
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
                                    <TableCell>{order.wholesalerId?.companyName || order.wholesalerId?.name || "N/A"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
