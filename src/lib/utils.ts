import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Image imports are a URL string in Vite and a StaticImageData object in Next. */
export function src(m: string | { src: string }) {
  return typeof m === "string" ? m : m.src;
}
