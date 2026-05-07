import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  const azMap: Record<string, string> = {
    'ə': 'e', 'ü': 'u', 'ö': 'o', 'ğ': 'g',
    'ı': 'i', 'ş': 's', 'ç': 'c', 'Ə': 'e',
    'Ü': 'u', 'Ö': 'o', 'Ğ': 'g', 'İ': 'i',
    'Ş': 's', 'Ç': 'c'
  }
  return text
    .split('')
    .map(char => azMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
