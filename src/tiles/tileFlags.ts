// Bit-masks for statusBits
export const NOFLAGS = 0x0000
export const POWERBIT = 0x8000 // bit 15, tile has power.
export const CONDBIT = 0x4000 // bit 14. tile can conduct electricity.
export const BURNBIT = 0x2000 // bit 13, tile can be lit.
export const BULLBIT = 0x1000 // bit 12, tile is bulldozable.
export const ANIMBIT = 0x0800 // bit 11, tile is animated.
export const ZONEBIT = 0x0400 // bit 10, tile is the center tile of the zone.

export const BLBNBIT = BULLBIT | BURNBIT
export const BLBNCNBIT = BULLBIT | BURNBIT | CONDBIT
export const BNCNBIT = BURNBIT | CONDBIT
export const ASCBIT = ANIMBIT | CONDBIT | BURNBIT
export const ALLBITS = POWERBIT | CONDBIT | BURNBIT | BULLBIT | ANIMBIT | ZONEBIT

export const BIT_START = 0x400
export const BIT_END = 0x8000
export const BIT_MASK = BIT_START - 1
