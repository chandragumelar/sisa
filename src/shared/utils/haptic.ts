const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

export function hapticLight(): void {
  if (canVibrate) navigator.vibrate(10)
}

export function hapticMedium(): void {
  if (canVibrate) navigator.vibrate(25)
}
