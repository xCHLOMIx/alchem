"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Role = "farmer" | "wholesaler" | "transporter";

type RegisterResponse = {
    error?: string;
    message?: string;
};

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<Role>("farmer");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [district, setDistrict] = useState("");

    const [idNumber, setIdNumber] = useState("");
    const [vehiclePlateNumber, setVehiclePlateNumber] = useState("");

    const [companyName, setCompanyName] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role,
                name,
                phone,
                password,
                district,
                idNumber: role === "transporter" ? idNumber : undefined,
                vehiclePlateNumber: role === "transporter" ? vehiclePlateNumber : undefined,
                companyName: role === "wholesaler" ? companyName : undefined,
            }),
        });

        const data = (await response.json()) as RegisterResponse;
        setLoading(false);

        if (!response.ok) {
            setError(data.error || "Registration failed");
            return;
        }

        setSuccess("Registration successful. Redirecting to login...");
        setTimeout(() => router.push("/login"), 800);
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl items-center bg-background p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="farmer">Farmer</SelectItem>
                                    <SelectItem value="wholesaler">Wholesaler / Manufacturer</SelectItem>
                                    <SelectItem value="transporter">Transporter</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="district">District</Label>
                                <Input
                                    id="district"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                />
                            </div>
                        </div>

                        {role === "transporter" ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="idNumber">ID Number</Label>
                                    <Input
                                        id="idNumber"
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
                                    <Input
                                        id="vehiclePlateNumber"
                                        value={vehiclePlateNumber}
                                        onChange={(e) => setVehiclePlateNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : null}

                        {role === "wholesaler" ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : null}

                        {error ? (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : null}
                        {success ? (
                            <Alert>
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        ) : null}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Creating account..." : "Register"}
                        </Button>
                    </form>

                    <p className="mt-4 text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="underline underline-offset-4">
                            Login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
