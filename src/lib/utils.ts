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

export const inputClass = "block w-full rounded-xl border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"

export const selectClass = "block w-full rounded-xl border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
