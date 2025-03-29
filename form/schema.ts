import * as z from 'zod';

export const cardReportSchema = z.object({
  round: z
    .string({
      required_error: 'Umferð er nauðsynleg',
    })
    .min(1, 'Umferð er nauðsynleg'),
  match: z
    .string({
      required_error: 'Leikur er nauðsynlegur',
    })
    .min(1, 'Leikur er nauðsynlegur'),
  referee: z
    .string({
      required_error: 'Dómari er nauðsynlegur',
    })
    .min(1, 'Dómari er nauðsynlegur'),
  playerTeam: z
    .string({
      required_error: 'Lið leikmanns er nauðsynlegt',
    })
    .min(1, 'Lið leikmanns er nauðsynlegt'),
  playerName: z
    .string({
      required_error: 'Nafn leikmanns er nauðsynlegt',
    })
    .min(1, 'Nafn leikmanns er nauðsynlegt'),
  playerNumber: z
    .string({
      required_error: 'Númer leikmanns er nauðsynlegt',
    })
    .min(1, 'Númer leikmanns er nauðsynlegt'),
  minute: z
    .string({
      required_error: 'Mínúta er nauðsynleg',
    })
    .min(1, 'Mínúta er nauðsynleg'),
  cardType: z.enum(['Yellow', 'YellowRed', 'Red', 'None'], {
    required_error: 'Spjald er nauðsynlegt',
    invalid_type_error: 'Ógilt spjald',
  }),
  reason: z
    .string({
      required_error: 'Ástæða er nauðsynleg',
    })
    .min(1, 'Ástæða er nauðsynleg'),
});

export const cardSchema = z.object({
  playerTeam: z
    .string({
      required_error: 'Lið leikmanns er nauðsynlegt',
    })
    .min(1, 'Lið leikmanns er nauðsynlegt'),
  playerName: z
    .string({
      required_error: 'Nafn leikmanns er nauðsynlegt',
    })
    .min(1, 'Nafn leikmanns er nauðsynlegt'),
  playerNumber: z
    .string({
      required_error: 'Númer leikmanns er nauðsynlegt',
    })
    .min(1, 'Númer leikmanns er nauðsynlegt'),
  minute: z
    .string({
      required_error: 'Mínúta er nauðsynleg',
    })
    .min(1, 'Mínúta er nauðsynleg'),
  cardType: z.enum(['Yellow', 'YellowRed', 'Red', 'None'], {
    required_error: 'Spjald er nauðsynlegt',
    invalid_type_error: 'Ógilt spjald',
  }),
});
