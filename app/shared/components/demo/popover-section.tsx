import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "~/shared/components/ui/popover";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";

export function PopoverSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Popover</h2>

      <div className="flex flex-wrap gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Dimensions</PopoverTitle>
              <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
            </PopoverHeader>
            <div className="mt-3 grid gap-3">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="pop-width">Width</Label>
                <Input id="pop-width" defaultValue="100%" className="col-span-2" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="pop-height">Height</Label>
                <Input id="pop-height" defaultValue="25px" className="col-span-2" />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Simple popover</Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <p className="text-sm">This is a simple popover with just some text content.</p>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
}
