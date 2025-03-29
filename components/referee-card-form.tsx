'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  Loader2,
  Clock,
  User,
  Swords,
  Gavel,
  Flag,
  Square,
  CircleHelp,
} from 'lucide-react';
import { Fixture, MatchEvent, MatchShort, PlayerInfo } from '@/types/types';
import axios from 'axios';
import { cardReportSchema } from '@/form/schema';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client';
import { AddRefereeDialog } from './add-referee-dialog';
import { AddCardDialog } from './add-card-dialog';
import { toast } from 'sonner';
import Image from 'next/image';

// Mock data - would be replaced with API data
const cardReasons = [
  'Unsporting behavior',
  'Dissent',
  'Persistent infringement',
  'Delaying restart',
  'Failing to respect distance',
  'Entering/leaving field without permission',
  'Serious foul play',
  'Violent conduct',
  'Denying goal with handball',
  'Denying goalscoring opportunity',
  'Offensive language/gestures',
  'Second caution',
];

export default function RefereeCardForm({
  fixtures,
  tournamentName,
  tournamentImg,
}: {
  fixtures: Fixture[];
  tournamentName: string;
  tournamentImg: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rounds, setRounds] = useState<string[]>([]);
  const [matches, setMatches] = useState<MatchShort[]>([]);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [playerId, setPlayerId] = useState<string>('');
  const [referees, setReferees] = useState<string[]>([]);
  const [loadingPlayer, setLoadingPlayer] = useState<boolean>(false);
  const [playerNumberNotFound, setPlayerNumberNotFound] =
    useState<boolean>(false);
  const [openRefereeModal, setOpenRefereeModal] = useState<boolean>(false);
  const [openCardModal, setOpenCardModal] = useState<boolean>(false);

  const supabase = createClient();
  const form = useForm<z.infer<typeof cardReportSchema>>({
    resolver: zodResolver(cardReportSchema),
    values: {
      round: '',
      match: '',
      referee: '',
      playerTeam: '',
      playerName: '',
      playerNumber: '',
      minute: '',
      cardType: 'None',
      reason: '',
    },
  });

  const selectedRound = form.watch('round');
  const selectedMatch = form.watch('match');
  const selectedReferee = form.watch('referee');
  const selectedReason = form.watch('reason');

  useEffect(() => {
    const fetchReferees = async () => {
      const { data, error } = await supabase.from('Referees').select();
      if (error) console.error('Error fetching referees:', error);
      setReferees(
        data
          ?.map((ref) => ref.refereeName)
          .sort((a, b) => a.localeCompare(b)) ?? []
      );
    };

    fetchReferees();
  }, [openRefereeModal]);

  useEffect(() => {
    const uniqueRounds = new Set<string>();
    fixtures.forEach((fixture) =>
      uniqueRounds.add(fixture.roundName.toString())
    );
    setRounds(
      Array.from(uniqueRounds).sort((a, b) => parseInt(a) - parseInt(b))
    );
  }, [fixtures]);

  useEffect(() => {
    setMatches(() => {
      return fixtures
        .filter((f) => f.roundName == selectedRound)
        .map((f) => ({
          id: f.id,
          display: `${f.home.name} vs ${f.away.name}`,
        }));
    });
    form.setValue('match', '');
    form.setValue('playerTeam', '');
    form.setValue('playerName', '');
    form.setValue('playerNumber', '');
    form.setValue('minute', '');
    form.setValue('cardType', 'None');
  }, [selectedRound]);

  useEffect(() => {
    const fetchMatchEvents = async () => {
      const res = await axios.post('/api/fotmob', {
        url: `matchDetails?matchId=${selectedMatch}`,
      });
      setMatchEvents(
        res.data.content.matchFacts.events.events.filter(
          (event: MatchEvent) => event.type === 'Card'
        )
      );
      const referee = res.data.content.matchFacts.infoBox.Referee.text;
      if (referee) {
        if (referees.includes(referee)) {
          form.setValue('referee', referee);
        } else {
          await supabase
            .from('Referees')
            .insert({ refereeName: referee.trim() });
          setReferees((prev) => [...prev, referee]);
        }
      }

      form.setValue('playerTeam', '');
      form.setValue('playerName', '');
      form.setValue('playerNumber', '');
      form.setValue('minute', '');
      form.setValue('cardType', 'None');
    };

    if (selectedMatch) fetchMatchEvents();
  }, [selectedMatch]);

  useEffect(() => {
    const fetchPlayer = async () => {
      setLoadingPlayer(true);
      setPlayerNumberNotFound(false);
      const res = await axios.post('/api/fotmob', {
        url: `playerData?id=${playerId}`,
      });
      if (res.data.isCoach) {
        form.setValue('playerNumber', 'Þjálfari');
      } else {
        const playerInfo: PlayerInfo[] = res.data.playerInformation;
        const playerNumber = playerInfo.find((info) => info.title === 'Shirt')
          ?.value.numberValue;
        form.setValue('playerNumber', playerNumber?.toString() || '');
        if (!playerNumber) setPlayerNumberNotFound(true);
      }
      form.setValue('playerTeam', res.data.primaryTeam.teamName);
      setLoadingPlayer(false);
    };

    if (playerId) fetchPlayer();
  }, [playerId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCardChange = (value: string, field: any) => {
    const [card, playerName, playerId, timeStr] = value.split('-');
    form.setValue('cardType', card as 'Yellow' | 'YellowRed' | 'Red');
    setPlayerId(playerId);
    form.setValue('minute', timeStr);
    field.onChange(playerName);
  };

  async function onSubmit(values: z.infer<typeof cardReportSchema>) {
    setIsSubmitting(true);
    // console.log('Submitting form:', values);
    try {
      await supabase.from('CardReports').insert({
        tournament: tournamentName,
        round: values.round,
        homeTeam: fixtures.find((f) => f.id === values.match)?.home.name,
        awayTeam: fixtures.find((f) => f.id === values.match)?.away.name,
        refereeName: values.referee,
        cardType: values.cardType,
        playerTeam: values.playerTeam,
        playerName: values.playerName,
        playerNumber: values.playerNumber,
        minute: values.minute,
        reason: values.reason,
      });
      toast.success('Spjaldskráning tókst!', {
        description: `Skráð ${new Date().toLocaleString('is-IS', {
          dateStyle: 'short',
          timeStyle: 'short',
        })}`,
      });
      form.setValue('playerTeam', '');
      form.setValue('playerName', '');
      form.setValue('playerNumber', '');
      form.setValue('minute', '');
      form.setValue('cardType', 'None');
      form.setValue('reason', '');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Villa kom upp við að skrá spjald', {
        description: 'Ef þetta endurtekur sig, hafðu samband við kerfisstjóra',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const DisplaySmallCard = ({ card }: { card: string }) => {
    if (card === 'Yellow') {
      return (
        <div className="w-3.5 h-5 bg-gradient-to-br from-yellow-300 to-amber-500 rounded shadow-sm"></div>
      );
    } else if (card === 'YellowRed') {
      return (
        <div className="relative w-3 h-3.5">
          <div className="absolute w-3 h-4 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-xs shadow-sm"></div>
          <div className="absolute w-3 h-4 bg-gradient-to-br from-red-500 to-red-700 rounded-xs shadow-sm transform translate-x-[3px] -translate-y-[3px]"></div>
        </div>
      );
    } else {
      return (
        <div className="w-3.5 h-5 bg-gradient-to-br from-red-500 to-red-700 rounded shadow-sm"></div>
      );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CardSelectValue = ({ control }: { control: any }) => {
    const cardType = useWatch({ control, name: 'cardType' });
    const playerName = useWatch({ control, name: 'playerName' });
    const minute = useWatch({ control, name: 'minute' });

    if (cardType === 'None') return null;
    return (
      <>
        <DisplaySmallCard card={cardType} />
        {playerName} - {minute}&apos;
      </>
    );
  };

  return (
    <Card className="w-full bg-slate-50 border-t-4 border-t-emerald-500">
      <CardHeader className="flex items-center justify-center">
        <div className="w-full max-w-[180px] h-[90px] bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center rounded-md mb-2 shadow-md">
          <Image
            src={`${tournamentImg}?height=90&width=180`}
            alt="Tournament logo"
            width={180}
            height={90}
            className="max-h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Spjaldskráning</h1>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="round"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Flag className="h-4 w-4 text-emerald-600" />
                    Umferð
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-slate-300 focus:ring-emerald-500 w-full">
                        <SelectValue placeholder="Veldu umferð" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rounds.map((round) => (
                        <SelectItem key={round} value={round}>
                          {isNaN(parseInt(round)) ? round : 'Umferð ' + round}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="match"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Swords className="h-4 w-4 text-emerald-600" />
                    Leikur
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-slate-300 focus:ring-emerald-500 w-full">
                        <SelectValue placeholder="Veldu leik" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!selectedRound ? (
                        <div className="w-full">
                          <p className="text-sm text-center text-slate-400">
                            Veldu umferð til að sjá leiki
                          </p>
                        </div>
                      ) : (
                        <>
                          {matches.map((match) => (
                            <SelectItem key={match.id} value={match.id}>
                              {match.display}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Gavel className="h-4 w-4 text-emerald-600" />
                    Dómari
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={selectedReferee}
                  >
                    <FormControl>
                      <SelectTrigger className="border-slate-300 focus:ring-emerald-500 w-full">
                        <SelectValue placeholder="Veldu dómara" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {referees?.map((referee) => (
                        <SelectItem key={referee} value={referee}>
                          {referee}
                        </SelectItem>
                      ))}
                      <AddRefereeDialog
                        open={openRefereeModal}
                        setOpen={() => setOpenRefereeModal(!openRefereeModal)}
                      />
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="playerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Square className="h-4 w-4 text-emerald-600" />
                    Spjald
                  </FormLabel>
                  <Select
                    defaultValue={field.value || ''}
                    onValueChange={(value) => onCardChange(value, field)}
                  >
                    <FormControl>
                      <SelectTrigger className="border-slate-300 focus:ring-emerald-500 w-full">
                        <SelectValue placeholder="Veldu spjald">
                          <CardSelectValue control={form.control} />
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!selectedMatch ? (
                        <div className="w-full">
                          <p className="text-sm text-center text-slate-400">
                            Veldu leik til að sjá spjöld
                          </p>
                        </div>
                      ) : (
                        <>
                          {matchEvents?.map((event, idx) => (
                            <SelectItem
                              key={idx}
                              value={`${event.card}-${event.fullName}-${event.playerId}-${event.timeStr}`}
                            >
                              <DisplaySmallCard card={event.card} />{' '}
                              {event.fullName} - {event.timeStr}&apos;
                            </SelectItem>
                          ))}
                          <AddCardDialog
                            open={openCardModal}
                            setOpen={() => setOpenCardModal(!openCardModal)}
                            selectedFixture={
                              fixtures.find((f) => f.id === selectedMatch)!
                            }
                            form={form}
                          />
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="playerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-emerald-600" />
                      Númer leikmanns
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          playerNumberNotFound ? 'Fannst ekki á FotMob' : ''
                        }
                        {...field}
                        value={loadingPlayer ? 'Loading...' : field.value}
                        className="border-slate-300 focus:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      Mínúta
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        {...field}
                        value={field.value || ''}
                        className="border-slate-300 focus:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cardType"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="flex items-center gap-1.5">
                    <Square className="h-4 w-4 text-emerald-600" />
                    Tegund
                  </FormLabel>
                  <FormControl>
                    <div className="flex space-x-4 justify-center">
                      <div
                        className={`w-7 h-10 rounded hover:scale-105 ${
                          field.value === 'Yellow' &&
                          'ring-2 ring-offset-2 ring-yellow-400 shadow-md scale-105'
                        }`}
                      >
                        <div className="w-7 h-10 bg-gradient-to-br from-yellow-300 to-amber-500 rounded shadow-sm"></div>
                      </div>

                      <div
                        className={`w-7 h-10 rounded flex items-center justify-center hover:scale-105 ${
                          field.value === 'YellowRed' &&
                          'ring-2 ring-offset-3 ring-amber-500 shadow-md scale-105'
                        }`}
                      >
                        <div className="relative w-6 h-9 -mb-1.5 -ml-1.5">
                          <div className="absolute w-6 h-9 bg-gradient-to-br from-yellow-300 to-amber-500 rounded shadow-sm"></div>
                          <div className="absolute w-6 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded shadow-sm transform translate-x-1.5 -translate-y-1.5"></div>
                        </div>
                      </div>

                      <div
                        className={`w-7 h-10 rounded hover:scale-105 ${
                          field.value === 'Red' &&
                          'ring-2 ring-offset-2 ring-red-500 shadow-md scale-105'
                        }`}
                      >
                        <div className="w-7 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded shadow-sm"></div>
                      </div>
                    </div>
                  </FormControl>
                  <div className="text-center text-sm font-medium text-slate-800">
                    {field.value === 'Yellow'
                      ? 'Gult Spjald'
                      : field.value === 'Red'
                      ? 'Rautt Spjald'
                      : field.value === 'YellowRed'
                      ? 'Seinna Gula'
                      : ''}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <CircleHelp className="h-4 w-4 text-emerald-600" />
                    Ástæða
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={selectedReason}
                  >
                    <FormControl>
                      <SelectTrigger className="border-slate-300 focus:ring-emerald-500 w-full">
                        <SelectValue placeholder="Veldu ástæðu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cardReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:opacity-85 hover:bg-emerald-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Skila inn skráningu'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
