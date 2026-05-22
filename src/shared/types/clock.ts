export interface Clock {
  now(): number // epoch ms
  today(): Date // midnight local time, start of today
}
