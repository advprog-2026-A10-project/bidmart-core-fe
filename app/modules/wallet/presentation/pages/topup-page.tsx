import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/shared/components/ui/button";
import { TopUpForm } from "../components/topup-form";

export default function TopUpPage() {
  return (
    <div className="animate-in slide-in-from-right-10 container max-w-2xl space-y-6 py-10 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/wallet">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Top Up Balance</h1>
          <p className="text-muted-foreground">Add funds securely to your wallet</p>
        </div>
      </div>

      <div className="py-6">
        <TopUpForm />
      </div>
    </div>
  );
}
