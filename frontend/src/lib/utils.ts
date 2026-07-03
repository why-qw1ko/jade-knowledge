import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
}

export function formatDateTime(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN');
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
