export class Variables {
  private store = new Map<string, unknown>()

  set(name: string, value: unknown): void {
    this.store.set(name, value)
  }

  get(name: string): unknown {
    return this.store.get(name)
  }

  has(name: string): boolean {
    return this.store.has(name)
  }

  /**
   * Replaces ${varName} tokens in a string with stored variable values.
   */
  interpolate(str: string): string {
    return str.replace(/\$\{([^}]+)\}/g, (_match, name: string) => {
      if (this.store.has(name)) {
        return String(this.store.get(name))
      }
      return _match
    })
  }

  clone(): Variables {
    const copy = new Variables()
    for (const [k, v] of this.store) {
      copy.set(k, v)
    }
    return copy
  }
}
