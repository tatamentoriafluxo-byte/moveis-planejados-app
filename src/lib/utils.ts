import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d)
}

// Calcula área em m² a partir de mm
export function calcularAreaM2(comprimentoMm: number, larguraMm: number): number {
  return (comprimentoMm * larguraMm) / 1000000
}

// Calcula custo por m² considerando perda
export function calcularCustoM2ComPerda(
  valorChapa: number,
  larguraChapa: number,
  alturaChapa: number,
  percentualPerda: number = 15
): number {
  const areaChapa = (larguraChapa * alturaChapa) / 1000000
  const areaUtil = areaChapa * (1 - percentualPerda / 100)
  return valorChapa / areaUtil
}
