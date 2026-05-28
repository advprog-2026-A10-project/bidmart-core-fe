import { Separator } from "~/shared/components/ui/separator";
import { ColorSection } from "~/shared/components/demo/color-section";
import { TypographySection } from "~/shared/components/demo/typography-section";
import { AvatarSection } from "~/shared/components/demo/avatar-section";
import { BadgeSection } from "~/shared/components/demo/badge-section";
import { ButtonSection } from "~/shared/components/demo/button-section";
import { CardSection } from "~/shared/components/demo/card-section";
import { CheckboxSection } from "~/shared/components/demo/checkbox-section";
import { DialogSection } from "~/shared/components/demo/dialog-section";
import { DropdownMenuSection } from "~/shared/components/demo/dropdown-menu-section";
import { FormSection } from "~/shared/components/demo/form-section";
import { InputSection } from "~/shared/components/demo/input-section";
import { LabelSection } from "~/shared/components/demo/label-section";
import { PopoverSection } from "~/shared/components/demo/popover-section";
import { RadioGroupSection } from "~/shared/components/demo/radio-group-section";
import { ScrollAreaSection } from "~/shared/components/demo/scroll-area-section";
import { SelectSection } from "~/shared/components/demo/select-section";
import { SeparatorSection } from "~/shared/components/demo/separator-section";
import { SkeletonSection } from "~/shared/components/demo/skeleton-section";
import { SonnerSection } from "~/shared/components/demo/sonner-section";
import { TableSection } from "~/shared/components/demo/table-section";
import { TabsSection } from "~/shared/components/demo/tabs-section";
import { TextareaSection } from "~/shared/components/demo/textarea-section";

const sections = [
  { id: "colors", label: "Colors", Component: ColorSection },
  { id: "typography", label: "Typography", Component: TypographySection },
  { id: "avatar", label: "Avatar", Component: AvatarSection },
  { id: "badge", label: "Badge", Component: BadgeSection },
  { id: "button", label: "Button", Component: ButtonSection },
  { id: "card", label: "Card", Component: CardSection },
  { id: "checkbox", label: "Checkbox", Component: CheckboxSection },
  { id: "dialog", label: "Dialog", Component: DialogSection },
  { id: "dropdown-menu", label: "Dropdown Menu", Component: DropdownMenuSection },
  { id: "form", label: "Form", Component: FormSection },
  { id: "input", label: "Input", Component: InputSection },
  { id: "label", label: "Label", Component: LabelSection },
  { id: "popover", label: "Popover", Component: PopoverSection },
  { id: "radio-group", label: "Radio Group", Component: RadioGroupSection },
  { id: "scroll-area", label: "Scroll Area", Component: ScrollAreaSection },
  { id: "select", label: "Select", Component: SelectSection },
  { id: "separator", label: "Separator", Component: SeparatorSection },
  { id: "skeleton", label: "Skeleton", Component: SkeletonSection },
  { id: "sonner", label: "Sonner", Component: SonnerSection },
  { id: "table", label: "Table", Component: TableSection },
  { id: "tabs", label: "Tabs", Component: TabsSection },
  { id: "textarea", label: "Textarea", Component: TextareaSection },
];

export function DesignSystemDemoPage() {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-48 shrink-0 overflow-y-auto border-r p-4 lg:block">
        <p className="mb-3 text-xs font-semibold tracking-widest uppercase">Components</p>
        <nav className="flex flex-col gap-1">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-sm transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-3xl font-bold">Design System</h1>
          <p className="text-muted-foreground mb-10 text-sm">
            A showcase of all shared UI components.
          </p>

          <div className="space-y-0">
            {sections.map(({ id, Component }, index) => (
              <div key={id} id={id}>
                <div className="py-10">
                  <Component />
                </div>
                {index < sections.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
