/**
 * Calcula el hash SHA-256 de un archivo local en el navegador del usuario.
 * @param file Archivo cargado por el usuario
 * @returns Hash hexadecimal SHA-256
 */
export async function calculateFileSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatETH(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 ETH";
  return `${num.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ETH`;
}
