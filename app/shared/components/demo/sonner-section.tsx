import { toast } from "sonner";
import { Button } from "~/shared/components/ui/button";

export function SonnerSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Sonner (Toast)</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Types</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast("Default toast notification")}>
            Default
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Operation completed successfully!")}
          >
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error("Something went wrong.")}>
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning("Proceed with caution.")}
          >
            Warning
          </Button>
          <Button variant="outline" onClick={() => toast.info("Here is some information.")}>
            Info
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">With description</p>
        <Button
          variant="outline"
          onClick={() =>
            toast("Event scheduled", {
              description: "Monday, January 3rd at 6:00pm",
              action: { label: "Undo", onClick: () => {} },
            })
          }
        >
          With description & action
        </Button>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Promise</p>
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
              loading: "Loading...",
              success: "Data loaded!",
              error: "Failed to load.",
            })
          }
        >
          Promise toast
        </Button>
      </div>
    </section>
  );
}
