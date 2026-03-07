# Learnings — bidmart-core-routes

Accumulated knowledge from task execution.

---
## 2026-03-07 Task 1: shadcn Component Installation

### Command Executed
```bash
pnpm dlx shadcn@latest add select tabs separator radio-group checkbox scroll-area dropdown-menu popover avatar
```

### Components Installed (9 total)
- ✅ select.tsx
- ✅ tabs.tsx
- ✅ separator.tsx
- ✅ radio-group.tsx
- ✅ checkbox.tsx
- ✅ scroll-area.tsx
- ✅ dropdown-menu.tsx
- ✅ popover.tsx
- ✅ avatar.tsx

### Installation Issues & Resolution
- **Issue**: pnpm store version mismatch (v10 vs v3) - "Unexpected store location" error
- **Resolution**: Ran `pnpm install` to reinitialize node_modules with new store reference

### Verification Results
- ✅ All 9 files created in `app/shared/components/ui/`
- ✅ `pnpm typecheck` exits 0 (no TypeScript errors)
- ✅ `components.json` auto-updated by shadcn CLI
- ✅ `package.json` and `pnpm-lock.yaml` updated with radix-ui dependencies

### Key Learnings
1. Single command installation for multiple components is efficient
2. pnpm store version conflicts can occur in development environments - use `pnpm install` to resolve
3. All shadcn components follow the same directory structure under `app/shared/components/ui/`
4. No manual config changes needed - shadcn CLI handles everything

### Blocked Tasks Unblocked
This task unblocks all remaining tasks (T2–T13) which depend on having core UI components available.
