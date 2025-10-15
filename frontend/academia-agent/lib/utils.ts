// Small utility to conditionally join class names.
// Mirrors the typical `cn`/`classnames` helper used in many Next.js templates.
export function cn(...inputs: Array<string | number | null | undefined | false | Record<string, boolean> | Array<string | false | null | undefined>>): string {
  const out: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input))
      continue
    }

    if (Array.isArray(input)) {
      const inner = cn(...input)
      if (inner) out.push(inner)
      continue
    }

    if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key)
      }
      continue
    }
  }

  return out.join(' ').trim()
}

export default cn
