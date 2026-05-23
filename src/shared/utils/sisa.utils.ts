/** sisa = totalSaldo − tagihan belum dibayar − total nabung */
export function calcSisa(
  totalSaldo: number,
  unpaidTagihanTotal: number,
  totalNabung: number,
): number {
  return totalSaldo - unpaidTagihanTotal - totalNabung
}
