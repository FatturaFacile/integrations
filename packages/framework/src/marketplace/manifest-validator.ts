export interface IntegrationManifest {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  category: string;
  tier?: number;
  dependencies: Record<string, string>;
  permissions: string[];
  supportedErpVersion: string;
  supportedPlatforms: string[];
  mcp?: {
    enabled?: boolean;
    tools?: string[];
    resources?: string[];
  };
}

export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateManifest(data: unknown): ManifestValidationResult {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Manifest must be a non-null JSON object'] };
  }

  const m = data as Partial<IntegrationManifest>;

  if (!m.name || typeof m.name !== 'string' || !/^@fatturafacile\/integration-[a-z0-9-]+$/.test(m.name)) {
    errors.push("Invalid or missing 'name': must match pattern '^@fatturafacile/integration-[a-z0-9-]+$'");
  }

  if (!m.description || typeof m.description !== 'string' || m.description.length > 280) {
    errors.push("Invalid or missing 'description': must be string <= 280 characters");
  }

  if (!m.version || typeof m.version !== 'string' || !/^[0-9]+\.[0-9]+\.[0-9]+(-.*)?$/.test(m.version)) {
    errors.push("Invalid or missing 'version': must be valid SemVer string");
  }

  if (!m.author || typeof m.author !== 'string') {
    errors.push("Missing 'author'");
  }

  if (!m.license || !['MIT', 'Apache-2.0'].includes(m.license)) {
    errors.push("Invalid or missing 'license': must be 'MIT' or 'Apache-2.0'");
  }

  if (!m.category || typeof m.category !== 'string') {
    errors.push("Missing 'category'");
  }

  if (!m.dependencies || typeof m.dependencies !== 'object') {
    errors.push("Missing 'dependencies' dictionary");
  }

  if (!Array.isArray(m.permissions)) {
    errors.push("Missing 'permissions' array");
  }

  if (!m.supportedErpVersion || typeof m.supportedErpVersion !== 'string') {
    errors.push("Missing 'supportedErpVersion'");
  }

  if (!Array.isArray(m.supportedPlatforms) || m.supportedPlatforms.length === 0) {
    errors.push("Missing 'supportedPlatforms' array");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
