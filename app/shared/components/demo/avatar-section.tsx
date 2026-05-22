import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "~/shared/components/ui/avatar";

export function AvatarSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Avatar</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Sizes</p>
        <div className="flex items-center gap-4">
          <Avatar size="sm">
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Fallback</p>
        <div className="flex items-center gap-4">
          <Avatar size="sm">
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>EF</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">With badge</p>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>SC</AvatarFallback>
            <AvatarBadge />
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>LG</AvatarFallback>
            <AvatarBadge />
          </Avatar>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Group</p>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+5</AvatarGroupCount>
        </AvatarGroup>
      </div>
    </section>
  );
}
