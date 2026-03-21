"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginResponse = {
    error?: string;
    user?: {
        role: "farmer" | "wholesaler" | "transporter";
    };
};

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, password }),
        });

        const data = (await response.json()) as LoginResponse;
        setLoading(false);

        if (!response.ok) {
            setError(data.error || "Login failed");
            return;
        }

        if (data.user?.role === "farmer") {
            router.push("/farmer/dashboard");
            return;
        }

        if (data.user?.role === "wholesaler") {
            router.push("/wholesaler/dashboard");
            return;
        }

        router.push("/transporter/dashboard");
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md items-center bg-background p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone number</Label>
                            <Input
                                id="phone"
                                placeholder="e.g. 07XXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error ? (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : null}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>

                    <p className="mt-4 text-sm text-muted-foreground">
                        New here?{" "}
                        <Link href="/register" className="underline underline-offset-4">
                            Register
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
