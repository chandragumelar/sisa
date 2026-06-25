/** sisa = totalSaldo − tagihan belum dibayar */
export function calcSisa(totalSaldo: number, unpaidTagihanTotal: number): number {
  return totalSaldo - unpaidTagihanTotal
}
