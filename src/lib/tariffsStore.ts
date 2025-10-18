import { RawOffer } from "./types"

export interface TariffVersion {
  id: string // tv_<id>
  provider: string
  rail: "BANK" | "P2P"
  createdAt: number // Date.now()
  notes?: string
  rawText: string // canonical pasted/cleaned text
  offers: RawOffer[]
}

export interface TariffIndexItem {
  id: string
  provider: string
  rail: "BANK" | "P2P"
  createdAt: number
  offersCount: number
}

const STORAGE_KEY = "fairlend.tariffs.v1"
const INDEX_KEY = "fairlend.tariffs.index"

function uid(prefix = "tv"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`
}

function readVersions(): TariffVersion[] {
  if (typeof window === "undefined") return []
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as TariffVersion[]) : []
  } catch {
    return []
  }
}

function writeVersions(versions: TariffVersion[]): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(versions))
  // Update index
  const index: TariffIndexItem[] = versions.map((v) => ({
    id: v.id,
    provider: v.provider,
    rail: v.rail,
    createdAt: v.createdAt,
    offersCount: v.offers.length,
  }))
  sessionStorage.setItem(INDEX_KEY, JSON.stringify(index))
}

export function saveVersion(v: TariffVersion): void {
  const versions = readVersions()
  // Check for duplicate ID
  const existing = versions.findIndex((ver) => ver.id === v.id)
  if (existing !== -1) {
    versions[existing] = v
  } else {
    versions.push(v)
  }
  writeVersions(versions)
}

export function listVersions(): TariffIndexItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = sessionStorage.getItem(INDEX_KEY)
    return stored ? (JSON.parse(stored) as TariffIndexItem[]) : []
  } catch {
    return []
  }
}

export function getVersion(id: string): TariffVersion | null {
  const versions = readVersions()
  return versions.find((v) => v.id === id) || null
}

export function deleteVersion(id: string): void {
  const versions = readVersions().filter((v) => v.id !== id)
  writeVersions(versions)
}

export function exportAll(): TariffVersion[] {
  return readVersions()
}

export function importAll(payload: TariffVersion[]): void {
  if (!Array.isArray(payload)) {
    throw new Error("Invalid payload: expected array of TariffVersion")
  }
  const existing = readVersions()
  const existingIds = new Set(existing.map((v) => v.id))

  // Merge: add new versions, skip duplicates
  const merged = [...existing]
  for (const v of payload) {
    if (!existingIds.has(v.id)) {
      merged.push(v)
    }
  }

  writeVersions(merged)
}

export function generateTariffId(): string {
  return uid("tv")
}

