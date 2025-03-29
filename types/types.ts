export type Fixture = {
  id: string
  round: string
  roundName: string | number
  home: Team
  away: Team
}

export type MatchShort = {
  id: string
  display: string
} 

export type MatchEvent = {
  type: string
  card: string
  fullName: string
  playerId: number
  time: number
  timeStr: string
  isHome: boolean
}

export type PlayerInfo = {
  title: string
  value: PlayerInfoValue
}

export type PlayerInfoValue = {
  numberValue: number
  fallback: number | string
}

export type Team = {
  id: string
  name: string
}
