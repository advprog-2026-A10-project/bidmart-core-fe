#!/usr/bin/env tsx
/**
 * create-module.ts — Module scaffold generator for bidmart-core-fe
 *
 * Usage:
 *   pnpm tsx scripts/create-module.ts <module-name> [--entity <EntityName>] [--use-cases <uc1,uc2,...>]
 *
 * Examples:
 *   pnpm tsx scripts/create-module.ts payment
 *   pnpm tsx scripts/create-module.ts payment --entity Payment
 *   pnpm tsx scripts/create-module.ts payment --entity Payment --use-cases "get-payment,create-payment,cancel-payment"
 *
 * Generates the following structure under app/modules/<module-name>/:
 *   domain/
 *     entities/<entity>.ts
 *     repositories/<module>-repository.interface.ts
 *     errors/<module>-errors.ts
 *     errors/index.ts
 *     index.ts
 *   application/
 *     use-cases/<verb>-<subject>.use-case.ts  (one per use-case)
 *     use-cases/index.ts
 *     dtos/<module>.dto.ts
 *     dtos/index.ts
 *     index.ts
 *   infrastructure/
 *     api/<module>-api.mapper.ts
 *     api/schemas.ts
 *     repositories/<module>-api.repository.ts
 *     factories/<module>-repository.factory.ts
 *     index.ts
 *   presentation/
 *     components/.gitkeep
 *     pages/<entity>-page.tsx
 *     pages/constant.ts
 *     index.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/** Write a file, creating parent directories as needed. Skips if already exists unless --force is passed. */
function writeFile(filePath: string, content: string, force: boolean): void {
  if (fs.existsSync(filePath) && !force) {
    console.log(`  ⏭  skip   ${path.relative(process.cwd(), filePath)} (already exists)`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  ✅ create ${path.relative(process.cwd(), filePath)}`);
}

// ─── Template generators ──────────────────────────────────────────────────────

function domainEntityTemplate(entityName: string): string {
  const idType = `${entityName}Id`;
  return `/**
 * ${entityName} — Domain Entity
 *
 * Pure TypeScript type with no framework or infrastructure dependencies (DIP, SRP).
 */
export type ${entityName} = {
  readonly id: ${idType};
  // TODO: add domain fields here
};

/**
 * ${idType} — branded string type enforcing type safety at boundaries.
 */
export type ${idType} = string & { readonly __brand: "${idType}" };

/**
 * Factory for creating a validated ${idType} value object.
 */
export function create${idType}(value: string): ${idType} {
  if (!value || value.trim().length === 0) {
    throw new Error("${idType} cannot be empty.");
  }
  return value as ${idType};
}

/**
 * Factory for creating a ${entityName} entity with validation.
 */
export function create${entityName}(params: {
  id: string;
  // TODO: add entity params here
}): ${entityName} {
  if (!params.id || params.id.trim().length === 0) {
    throw new Error("${entityName} id cannot be empty.");
  }
  return {
    id: create${idType}(params.id),
    // TODO: map remaining fields
  };
}
`;
}

function domainRepositoryInterfaceTemplate(moduleName: string, entityName: string): string {
  const interfaceName = `I${toPascalCase(moduleName)}Repository`;
  return `import type { ${entityName} } from "../entities/${toKebabCase(entityName)}";

/**
 * ${interfaceName} — Repository Interface (Port)
 *
 * Defines the contract for ${moduleName} data access. Use cases depend on this
 * abstraction, not on any concrete implementation (DIP).
 */
export interface ${interfaceName} {
  // TODO: add repository methods matching your use-cases
  // Example:
  // getById(params: { id: string }): Promise<${entityName}>;
}
`;
}

function domainErrorsTemplate(moduleName: string): string {
  const pascal = toPascalCase(moduleName);
  const errorBase = `${pascal}Error`;
  const constName = `${pascal.toUpperCase()}_NOT_FOUND`;
  return `import { AppError } from "~/shared/domain/errors/app-error";

/**
 * ${errorBase} — base domain error for all ${moduleName} errors.
 * SRP: all ${moduleName} domain errors extend this single base.
 */
export class ${errorBase} extends AppError {
  constructor(message: string, code: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "${errorBase}";
  }
}

/**
 * ${pascal}NotFoundError — thrown when a ${moduleName} resource cannot be found by ID.
 */
export class ${pascal}NotFoundError extends ${errorBase} {
  constructor(id: string) {
    super(\`${pascal} "\${id}" not found.\`, "${constName}", 404);
    this.name = "${pascal}NotFoundError";
  }
}
`;
}

function domainErrorsIndexTemplate(moduleName: string): string {
  return `export * from "./${toKebabCase(moduleName)}-errors";\n`;
}

function domainIndexTemplate(moduleName: string, entityKebab: string): string {
  return `export * from "./entities/${entityKebab}";
export * from "./repositories/${toKebabCase(moduleName)}-repository.interface";
export * from "./errors";
`;
}

function dtoTemplate(moduleName: string, entityName: string): string {
  return `/**
 * Input DTOs — define the shape of data flowing into use-cases.
 * Use cases receive these from the presentation layer.
 */

// TODO: define input DTOs for each use-case, e.g.:
// export type Get${entityName}DTO = {
//   id: string;
// };
`;
}

function entityDtoTemplate(entityName: string): string {
  return `/**
 * ${entityName}DTO — Output DTO returned by use-cases to the presentation layer.
 * Mirrors the domain entity shape without exposing branded types.
 */
export type ${entityName}DTO = {
  id: string;
  // TODO: add output fields here
};
`;
}

function dtoIndexTemplate(moduleName: string, entityDtoKebab: string): string {
  const moduleKebab = toKebabCase(moduleName);
  return `export * from "./${moduleKebab}.dto";
export * from "./${entityDtoKebab}.dto";
`;
}

function useCaseTemplate(useCaseName: string, moduleName: string): string {
  const pascal = toPascalCase(useCaseName);
  const repoInterface = `I${toPascalCase(moduleName)}Repository`;
  const repoParam = `${toCamelCase(moduleName)}Repository`;
  return `import type { ${repoInterface} } from "~/modules/${toKebabCase(moduleName)}/domain/repositories/${toKebabCase(moduleName)}-repository.interface";

/**
 * ${pascal}UseCase — TODO: describe what this use-case does.
 */
export class ${pascal}UseCase {
  constructor(private readonly ${repoParam}: ${repoInterface}) {}

  async execute(/* dto: TODO */): Promise<void> {
    // TODO: implement use-case logic using this.${repoParam}
  }
}
`;
}

function useCasesIndexTemplate(useCaseNames: string[]): string {
  const lines = useCaseNames.map((name) => `export * from "./${toKebabCase(name)}.use-case";`);
  return lines.join("\n") + "\n";
}

function applicationIndexTemplate(): string {
  return `export * from "./dtos";
export * from "./use-cases";
`;
}

function schemasTemplate(moduleName: string, entityName: string): string {
  return `import { z } from "zod";

/**
 * Zod schemas for validating raw API responses at the infrastructure boundary.
 * All API responses are validated here — never in use-cases or domain (DIP).
 */

export const ${toCamelCase(entityName)}ApiSchema = z.object({
  id: z.string(),
  // TODO: add API response fields here
});

// TODO: add additional response schemas as needed

export type ${entityName}ApiResponse = z.infer<typeof ${toCamelCase(entityName)}ApiSchema>;
`;
}

function apiMapperTemplate(moduleName: string, entityName: string): string {
  const mapperClass = `${toPascalCase(moduleName)}ApiMapper`;
  const moduleKebab = toKebabCase(moduleName);
  const entityKebab = toKebabCase(entityName);
  return `import { create${entityName} } from "~/modules/${moduleKebab}/domain/entities/${entityKebab}";
import type { ${entityName} } from "~/modules/${moduleKebab}/domain/entities/${entityKebab}";
import type { ${entityName}ApiResponse } from "./schemas";

/**
 * ${mapperClass} — maps raw API response objects to domain entities.
 *
 * SRP: single responsibility — translation between API shape and domain shape.
 */
export class ${mapperClass} {
  static toDomain(raw: ${entityName}ApiResponse): ${entityName} {
    return create${entityName}({
      id: raw.id,
      // TODO: map remaining fields
    });
  }
}
`;
}

function repositoryImplTemplate(moduleName: string, entityName: string): string {
  const moduleKebab = toKebabCase(moduleName);
  const entityKebab = toKebabCase(entityName);
  const className = `${toPascalCase(moduleName)}ApiRepository`;
  const interfaceName = `I${toPascalCase(moduleName)}Repository`;
  const mapperClass = `${toPascalCase(moduleName)}ApiMapper`;
  const schemaVar = `${toCamelCase(entityName)}ApiSchema`;
  return `import { apiClient } from "~/shared/infrastructure/http/api-client";
import type { ${entityName} } from "~/modules/${moduleKebab}/domain/entities/${entityKebab}";
import type { ${interfaceName} } from "~/modules/${moduleKebab}/domain/repositories/${moduleKebab}-repository.interface";
import { ${schemaVar} } from "../api/schemas";
import { ${mapperClass} } from "../api/${moduleKebab}-api.mapper";

/**
 * ${className} — concrete implementation of ${interfaceName}.
 *
 * LSP: fully substitutable for ${interfaceName} everywhere it is used.
 * OCP: new data sources extend ${interfaceName} without modifying use-cases.
 *
 * All responses are validated against Zod schemas at this boundary (fail-fast).
 */
export class ${className} implements ${interfaceName} {
  private readonly basePath = "/${moduleKebab}s"; // TODO: update base path

  // TODO: implement interface methods, e.g.:
  // async getById(params: { id: string }): Promise<${entityName}> {
  //   const raw = await apiClient.get<unknown>(\`\${this.basePath}/\${params.id}\`);
  //   const validated = ${schemaVar}.parse(raw);
  //   return ${mapperClass}.toDomain(validated);
  // }
}
`;
}

function factoryTemplate(moduleName: string, useCaseNames: string[]): string {
  const moduleKebab = toKebabCase(moduleName);
  const modulePascal = toPascalCase(moduleName);
  const repoClass = `${modulePascal}ApiRepository`;
  const useCasesType = `${modulePascal}UseCases`;
  const factoryFn = `create${modulePascal}UseCases`;
  const getterFn = `get${modulePascal}UseCases`;
  const singleton = `_${toCamelCase(moduleName)}UseCases`;

  const importLines = useCaseNames
    .map((name) => {
      const pascal = toPascalCase(name);
      const kebab = toKebabCase(name);
      return `import { ${pascal}UseCase } from "~/modules/${moduleKebab}/application/use-cases/${kebab}.use-case";`;
    })
    .join("\n");

  const typeFields = useCaseNames
    .map((name) => {
      const pascal = toPascalCase(name);
      const camel = toCamelCase(name);
      return `  ${camel}: ${pascal}UseCase;`;
    })
    .join("\n");

  const constructLines = useCaseNames
    .map((name) => {
      const pascal = toPascalCase(name);
      const camel = toCamelCase(name);
      return `    ${camel}: new ${pascal}UseCase(${toCamelCase(moduleName)}Repository),`;
    })
    .join("\n");

  return `import { ${repoClass} } from "../repositories/${moduleKebab}-api.repository";
${importLines}

/**
 * ${modulePascal}UseCaseFactory — wires up the dependency graph for the ${moduleName} module.
 *
 * Factory pattern: centralises construction so that swap-ins (e.g. mock repos in tests)
 * only require changing this one place. Use cases are unaware of which concrete
 * repository implementation they receive (DIP satisfied).
 */
export type ${useCasesType} = {
${typeFields}
};

export function ${factoryFn}(): ${useCasesType} {
  const ${toCamelCase(moduleName)}Repository = new ${repoClass}();

  return {
${constructLines}
  };
}

// Singleton for client-side usage (avoids re-creating on every render)
let ${singleton}: ${useCasesType} | undefined;

export function ${getterFn}(): ${useCasesType} {
  if (!${singleton}) {
    ${singleton} = ${factoryFn}();
  }
  return ${singleton};
}
`;
}

function infrastructureIndexTemplate(moduleName: string): string {
  const moduleKebab = toKebabCase(moduleName);
  return `export * from "./api/schemas";
export * from "./api/${moduleKebab}-api.mapper";
export * from "./repositories/${moduleKebab}-api.repository";
export * from "./factories/${moduleKebab}-repository.factory";
`;
}

function presentationPageTemplate(moduleName: string, entityName: string): string {
  const modulePascal = toPascalCase(moduleName);
  return `/**
 * ${entityName}Page — placeholder page for the ${moduleName} module.
 * TODO: replace with real implementation wired to use-cases.
 */
export default function ${entityName}Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">${modulePascal}</h1>
      <p className="text-muted-foreground">TODO: implement ${moduleName} page</p>
    </div>
  );
}
`;
}

function presentationConstantTemplate(moduleName: string): string {
  const moduleUpper = moduleName.toUpperCase().replace(/-/g, "_");
  return `/**
 * ${toPascalCase(moduleName)} — presentation-layer constants.
 * Mock payloads here are for development/demo only. Remove once wired to real use-cases.
 */
export const ${moduleUpper}_MOCK_PAYLOADS = {
  // TODO: add mock data for development
} as const;
`;
}

function presentationIndexTemplate(entityName: string): string {
  const entityKebab = toKebabCase(entityName);
  return `export { default as ${entityName}Page } from "./pages/${entityKebab}-page";
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): {
  moduleName: string;
  entityName: string;
  useCaseNames: string[];
  force: boolean;
} {
  const args = argv.slice(2); // strip node + script path

  if (args.length === 0 || args[0].startsWith("--")) {
    console.error("Usage: pnpm tsx scripts/create-module.ts <module-name> [options]");
    console.error("Options:");
    console.error(
      "  --entity <EntityName>           PascalCase entity name (default: derived from module name)",
    );
    console.error(
      "  --use-cases <uc1,uc2,...>       Comma-separated list of use-case names in kebab-case",
    );
    console.error("  --force                          Overwrite existing files");
    process.exit(1);
  }

  const moduleName = toKebabCase(args[0]);
  let entityName = toPascalCase(moduleName);
  let useCaseNames: string[] = [`get-${moduleName}`];
  let force = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--entity" && args[i + 1]) {
      entityName = toPascalCase(args[++i]);
    } else if (args[i] === "--use-cases" && args[i + 1]) {
      useCaseNames = args[++i]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (args[i] === "--force") {
      force = true;
    }
  }

  return { moduleName, entityName, useCaseNames, force };
}

function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..");
  const modulesDir = path.join(projectRoot, "app", "modules");

  const { moduleName, entityName, useCaseNames, force } = parseArgs(process.argv);

  const moduleDir = path.join(modulesDir, moduleName);
  const entityKebab = toKebabCase(entityName);

  // Guard: prevent overwriting existing module without --force
  if (fs.existsSync(moduleDir) && !force) {
    console.warn(`\n⚠️  Module "${moduleName}" already exists at ${moduleDir}`);
    console.warn("   Use --force to overwrite existing files.\n");
    // Continue to create any missing files rather than abort
  }

  console.log(`\n🏗  Scaffolding module: ${moduleName}`);
  console.log(`   Entity:     ${entityName}`);
  console.log(`   Use-cases:  ${useCaseNames.join(", ")}`);
  console.log(`   Target:     ${path.relative(projectRoot, moduleDir)}\n`);

  // ── Domain layer ────────────────────────────────────────────────────────────
  writeFile(
    path.join(moduleDir, "domain", "entities", `${entityKebab}.ts`),
    domainEntityTemplate(entityName),
    force,
  );
  writeFile(
    path.join(moduleDir, "domain", "repositories", `${moduleName}-repository.interface.ts`),
    domainRepositoryInterfaceTemplate(moduleName, entityName),
    force,
  );
  writeFile(
    path.join(moduleDir, "domain", "errors", `${moduleName}-errors.ts`),
    domainErrorsTemplate(moduleName),
    force,
  );
  writeFile(
    path.join(moduleDir, "domain", "errors", "index.ts"),
    domainErrorsIndexTemplate(moduleName),
    force,
  );
  writeFile(
    path.join(moduleDir, "domain", "index.ts"),
    domainIndexTemplate(moduleName, entityKebab),
    force,
  );

  // ── Application layer ────────────────────────────────────────────────────────
  for (const useCaseName of useCaseNames) {
    writeFile(
      path.join(moduleDir, "application", "use-cases", `${toKebabCase(useCaseName)}.use-case.ts`),
      useCaseTemplate(useCaseName, moduleName),
      force,
    );
  }
  writeFile(
    path.join(moduleDir, "application", "use-cases", "index.ts"),
    useCasesIndexTemplate(useCaseNames),
    force,
  );
  const entityDtoKebab = entityKebab === moduleName ? `${entityKebab}-output` : entityKebab;
  writeFile(
    path.join(moduleDir, "application", "dtos", `${moduleName}.dto.ts`),
    dtoTemplate(moduleName, entityName),
    force,
  );
  writeFile(
    path.join(moduleDir, "application", "dtos", `${entityDtoKebab}.dto.ts`),
    entityDtoTemplate(entityName),
    force,
  );
  writeFile(
    path.join(moduleDir, "application", "dtos", "index.ts"),
    dtoIndexTemplate(moduleName, entityName),
    force,
  );
  writeFile(path.join(moduleDir, "application", "index.ts"), applicationIndexTemplate(), force);

  // ── Infrastructure layer ─────────────────────────────────────────────────────
  writeFile(
    path.join(moduleDir, "infrastructure", "api", "schemas.ts"),
    schemasTemplate(moduleName, entityName),
    force,
  );
  writeFile(
    path.join(moduleDir, "infrastructure", "api", `${moduleName}-api.mapper.ts`),
    apiMapperTemplate(moduleName, entityName),
    force,
  );
  writeFile(
    path.join(moduleDir, "infrastructure", "repositories", `${moduleName}-api.repository.ts`),
    repositoryImplTemplate(moduleName, entityName),
    force,
  );
  writeFile(
    path.join(moduleDir, "infrastructure", "factories", `${moduleName}-repository.factory.ts`),
    factoryTemplate(moduleName, useCaseNames),
    force,
  );
  writeFile(
    path.join(moduleDir, "infrastructure", "index.ts"),
    infrastructureIndexTemplate(moduleName),
    force,
  );

  // ── Presentation layer ───────────────────────────────────────────────────────
  // .gitkeep for empty components dir
  const componentsKeep = path.join(moduleDir, "presentation", "components", ".gitkeep");
  if (!fs.existsSync(componentsKeep)) {
    fs.mkdirSync(path.dirname(componentsKeep), { recursive: true });
    fs.writeFileSync(componentsKeep, "");
    console.log(`  ✅ create ${path.relative(projectRoot, componentsKeep)}`);
  }
  writeFile(
    path.join(moduleDir, "presentation", "pages", `${entityKebab}-page.tsx`),
    presentationPageTemplate(moduleName, entityName),
    force,
  );
  writeFile(
    path.join(moduleDir, "presentation", "pages", "constant.ts"),
    presentationConstantTemplate(moduleName),
    force,
  );
  writeFile(
    path.join(moduleDir, "presentation", "index.ts"),
    presentationIndexTemplate(entityName),
    force,
  );

  console.log(`\n✨ Module "${moduleName}" scaffolded successfully!\n`);
  console.log("Next steps:");
  console.log(`  1. Define entity fields in domain/entities/${entityKebab}.ts`);
  console.log(
    `  2. Define repository methods in domain/repositories/${moduleName}-repository.interface.ts`,
  );
  console.log(`  3. Add input DTOs in application/dtos/${moduleName}.dto.ts`);
  console.log(`  4. Implement use-case logic in application/use-cases/`);
  console.log(`  5. Add Zod schemas in infrastructure/api/schemas.ts`);
  console.log(`  6. Implement mapper in infrastructure/api/${moduleName}-api.mapper.ts`);
  console.log(
    `  7. Implement repository in infrastructure/repositories/${moduleName}-api.repository.ts`,
  );
  console.log(`  8. Register routes for presentation pages in app/routes/\n`);
}

main();
