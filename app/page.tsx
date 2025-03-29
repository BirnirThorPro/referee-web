'use client';

import RefereeCardForm from '@/components/referee-card-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const BESTA_DEILDIN_ID = '215';
const FYRSTA_DEILD_ID = '216';
const MJOLKURBIKARINN_ID = '217';
const MEISTARABIKARINN_ID = '10009';
const LENGJAN_ID = '10076';
// const CURRENT_SEASON = new Date().getFullYear();

const tournaments = [
  { id: BESTA_DEILDIN_ID, name: 'Besta deildin', img: '/besta-deildin.png' },
  {
    id: MJOLKURBIKARINN_ID,
    name: 'Mjólkurbikarinn',
    img: '/mjolkurbikarinn.png_large',
  },
  { id: MEISTARABIKARINN_ID, name: 'Meistarar meistaranna', img: '/ksi.png' },
  { id: LENGJAN_ID, name: 'Lengjubikarinn', img: '/lengjubikarinn.png' },
  { id: FYRSTA_DEILD_ID, name: '1. deild', img: '/ksi.png' },
];

export default function Home() {
  const [leagueId, setLeagueId] = useState(BESTA_DEILDIN_ID);
  // const [season, setSeason] = useState(CURRENT_SEASON);
  const [fixtures, setFixtures] = useState([]);

  useEffect(() => {
    const fetchFixtures = async () => {
      const res = await axios.post('/api/fotmob', {
        url: `leagues?id=${leagueId}&season=${2024}`,
      });
      console.log(res.data.matches.allMatches);
      setFixtures(res.data.matches.allMatches);
    };

    fetchFixtures();
  }, [leagueId]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 py-8">
      {fixtures.length === 0 ? (
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      ) : (
        <div className="container mx-auto max-w-md flex flex-col justify-center">
          <Select
            onValueChange={(val) => {
              setFixtures([]);
              setLeagueId(val);
            }}
          >
            <SelectTrigger className='mb-2'>
              <SelectValue placeholder="Mót" />
            </SelectTrigger>

            <SelectContent>
              {tournaments.map((tournament) => (
                <SelectItem key={tournament.id} value={tournament.id} className={`${tournament.id === leagueId ? 'bg-green-50' : ''}`}>
                  {tournament.name}
                  {tournament.id === leagueId && (
                    <Check className="w-4 h-4 text-green-700" />
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <RefereeCardForm
            fixtures={fixtures}
            tournamentName={tournaments.find((t) => t.id === leagueId)?.name ?? 'Óskráð'}
            tournamentImg={
              tournaments.find((t) => t.id === leagueId)?.img ?? '/ksi.png'
            }
          />
        </div>
      )}
    </main>
  );
}
