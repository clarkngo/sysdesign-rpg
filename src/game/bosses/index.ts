export { thunderingHerd } from './thunderingHerd'
export { splitBrainHydra } from './splitBrain'
export { spofWyrm } from './spofWyrm'
export { memoryLeakSlime } from './memoryLeak'
export { retryStormSpecter } from './retryStorm'
export { hotPartitionGolem } from './hotPartition'
export { poisonQueueWraith } from './poisonQueue'
export { authzShadow } from './authzShadow'
export { replicationLagLurker } from './replicationLag'
export { coldStartWisp } from './coldStart'
export { schemaDriftMimic } from './schemaDrift'
export { backpressureKraken } from './backpressure'
export { rateLimitSphinx } from './rateLimit'
export { nPlusOneSerpent } from './nPlusOne'
export { clockSkewChronarch } from './clockSkew'
export { idempotencyImp } from './idempotency'
import { thunderingHerd } from './thunderingHerd'
import { splitBrainHydra } from './splitBrain'
import { spofWyrm } from './spofWyrm'
import { memoryLeakSlime } from './memoryLeak'
import { retryStormSpecter } from './retryStorm'
import { hotPartitionGolem } from './hotPartition'
import { poisonQueueWraith } from './poisonQueue'
import { authzShadow } from './authzShadow'
import { replicationLagLurker } from './replicationLag'
import { coldStartWisp } from './coldStart'
import { schemaDriftMimic } from './schemaDrift'
import { backpressureKraken } from './backpressure'
import { rateLimitSphinx } from './rateLimit'
import { nPlusOneSerpent } from './nPlusOne'
import { clockSkewChronarch } from './clockSkew'
import { idempotencyImp } from './idempotency'
import type { BossEncounter } from '../types'

export const BOSSES: BossEncounter[] = [
  thunderingHerd,
  splitBrainHydra,
  spofWyrm,
  memoryLeakSlime,
  retryStormSpecter,
  hotPartitionGolem,
  poisonQueueWraith,
  authzShadow,
  replicationLagLurker,
  coldStartWisp,
  schemaDriftMimic,
  backpressureKraken,
  rateLimitSphinx,
  nPlusOneSerpent,
  clockSkewChronarch,
  idempotencyImp,
]

export function getBoss(id: string): BossEncounter | undefined {
  return BOSSES.find((b) => b.id === id)
}
