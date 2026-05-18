import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "~/shared/components/ui/card";
import { Button } from "~/shared/components/ui/button";
import { Badge } from "~/shared/components/ui/badge";

export function CardSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Card</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>This is a card description with some supporting text.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Card content goes here. You can place any content inside.</p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Action</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardDescription>Card header with an action slot on the right.</CardDescription>
            <CardAction>
              <Badge>New</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm">The action slot aligns to the top right of the header.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
