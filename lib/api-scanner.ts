import fs from "node:fs";
import path from "node:path";

type ApiDefinition = { method: string; clientPath: string; code: string };
type PermissionModule = {
    module: string;
    fileName: string;
    features: {
        featureKey: string;
        featureName: string;
        apis: ApiDefinition[];
    }[];
};

export function scanAndGroupServices(
    directory: string,
    modules: PermissionModule[] = [],
) {
    if (!fs.existsSync(directory)) return modules;
    for (const file of fs.readdirSync(directory)) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanAndGroupServices(fullPath, modules);
            continue;
        }
        if (!/\.(ts|js)$/.test(file)) continue;
        const content = fs.readFileSync(fullPath, "utf8");
        const regex =
            /api\.(get|post|put|delete|patch)(?:<[^>]+>)?\(\s*[`"']([^`"'\n]+)[`"']/g;
        const moduleName = file.replace(/\.(ts|js)$/, "").toUpperCase();
        const groups: Record<string, ApiDefinition[]> = {};
        let match: RegExpExecArray | null;
        while ((match = regex.exec(content))) {
            const method = match[1].toUpperCase();
            let clientPath = match[2];
            if (
                clientPath.includes("+") ||
                clientPath.startsWith("http") ||
                clientPath.trim().length < 2
            )
                continue;
            clientPath = clientPath
                .split("?")[0]
                .replace(/\$\{[^}]+\}/g, ":id")
                .replace(/\/:\w+/g, "/:id");
            const resource =
                clientPath.split("/").filter(Boolean)[0] || "general";
            const codePath = clientPath
                .replace(/:id/g, "ID")
                .replace(/[^a-zA-Z0-9]/g, "_")
                .toUpperCase();
            const api = {
                method,
                clientPath,
                code: `${moduleName}_${method}_${codePath}`,
            };
            groups[resource] ??= [];
            if (!groups[resource].some((item) => item.code === api.code))
                groups[resource].push(api);
        }
        const features = Object.entries(groups).map(([resource, apis]) => ({
            featureKey: `${moduleName}_${resource.toUpperCase()}`,
            featureName: moduleName,
            apis: apis.sort(
                (a, b) =>
                    (({ GET: 1, POST: 2, PUT: 3, DELETE: 4, PATCH: 5 })[
                        a.method
                    ] ?? 6) -
                    ({ GET: 1, POST: 2, PUT: 3, DELETE: 4, PATCH: 5 }[
                        b.method
                    ] ?? 6),
            ),
        }));
        if (features.length)
            modules.push({ module: moduleName, fileName: file, features });
    }
    return modules;
}

export function runAutoScan() {
    const services = path.join(process.cwd(),  "services");
    const outputDirectory = path.join(process.cwd(), "data");
    const outputFile = path.join(outputDirectory, "api-permissions.json");
    try {
        fs.mkdirSync(outputDirectory, { recursive: true });
        const result = JSON.stringify(scanAndGroupServices(services), null, 2);
        if (
            !fs.existsSync(outputFile) ||
            fs.readFileSync(outputFile, "utf8") !== result
        )
            fs.writeFileSync(outputFile, result, "utf8");
    } catch (error) {
        console.error("[Auto-Scan] Không thể sinh permission manifest", error);
    }
}
