import Link from "next/link";
import { Truck, Wheat, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center bg-background p-6 md:p-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Agri Logistics Marketplace</CardTitle>
          <CardDescription>
            A simple MVP connecting farmers, wholesalers, and transporters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <Card size="sm" className="border bg-muted/30">
              <CardHeader className="gap-2">
                <Wheat className="size-4" />
                <CardTitle className="text-sm">Farmers</CardTitle>
                <CardDescription>Post products and view incoming orders.</CardDescription>
              </CardHeader>
            </Card>
            <Card size="sm" className="border bg-muted/30">
              <CardHeader className="gap-2">
                <Store className="size-4" />
                <CardTitle className="text-sm">Wholesalers</CardTitle>
                <CardDescription>Browse products and place purchase orders.</CardDescription>
              </CardHeader>
            </Card>
            <Card size="sm" className="border bg-muted/30">
              <CardHeader className="gap-2">
                <Truck className="size-4" />
                <CardTitle className="text-sm">Transporters</CardTitle>
                <CardDescription>Accept and complete delivery jobs.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
