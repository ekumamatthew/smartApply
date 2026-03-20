import { atom } from "jotai"

export const selectedCvIdAtom = atom<string | null>(null)
export const cvManagementErrorAtom = atom<string>("")
