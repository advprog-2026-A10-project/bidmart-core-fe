import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "~/shared/components/ui/select";
import { Label } from "~/shared/components/ui/label";

export function SelectSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Select</h2>

      <div className="flex flex-wrap gap-6">
        <div className="w-48 space-y-2">
          <Label>Default</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48 space-y-2">
          <Label>Small</Label>
          <Select>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Option A</SelectItem>
              <SelectItem value="b">Option B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48 space-y-2">
          <Label>With groups</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>North America</SelectLabel>
                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                <SelectItem value="cst">Central Time (CT)</SelectItem>
                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Europe</SelectLabel>
                <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                <SelectItem value="cet">Central European Time (CET)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48 space-y-2">
          <Label>Disabled</Label>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Not available" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="x">X</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
