export interface DependencyResolutionResult {
  satisfies: boolean;
  unresolved: string[];
}

export class DependencyResolver {
  public static verifyDependencies(
    required: Record<string, string>,
    installed: Record<string, string>
  ): DependencyResolutionResult {
    const unresolved: string[] = [];

    for (const [pkg, _reqVersion] of Object.entries(required)) {
      if (!installed[pkg]) {
        unresolved.push(pkg);
      }
    }

    return {
      satisfies: unresolved.length === 0,
      unresolved
    };
  }
}
