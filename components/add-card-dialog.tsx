import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Clock, Square, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { cardReportSchema, cardSchema } from '@/form/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { SelectValue } from '@radix-ui/react-select';
import { Fixture } from '@/types/types';

export const AddCardDialog = ({
  open = false,
  setOpen,
  selectedFixture,
  form,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedFixture: Fixture;
  form: ReturnType<typeof useForm<z.infer<typeof cardReportSchema>>>;
}) => {
  const cardForm = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    values: {
      playerTeam: '',
      playerName: '',
      playerNumber: '',
      minute: '',
      cardType: 'None',
    },
  });

  const onSubmit = (values: z.infer<typeof cardSchema>) => {
    const { playerTeam, playerName, playerNumber, minute, cardType } = values;

    form.setValue('playerTeam', playerTeam);
    form.setValue('playerName', playerName);
    form.setValue('playerNumber', playerNumber);
    form.setValue('minute', minute);
    form.setValue('cardType', cardType);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-full flex rounded-sm bg-slate-50 mt-1"
        >
          Nýtt Spjald <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="gap-1">
          <DialogTitle>Bæta við spjaldi</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Form {...cardForm}>
          <form
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={cardForm.control}
                name="playerTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-emerald-600" />
                      Lið
                    </FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border-slate-300 focus:ring-emerald-500 w-full">
                          <SelectValue placeholder="Lið leikmanns" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            key={selectedFixture.home.id}
                            value={selectedFixture.home.name}
                          >
                            {selectedFixture.home.name}
                          </SelectItem>
                          <SelectItem
                            key={selectedFixture.away.id}
                            value={selectedFixture.away.name}
                          >
                            {selectedFixture.away.name}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={cardForm.control}
                name="playerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-emerald-600" />
                      Nafn
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Fullt nafn leikmanns"
                        {...field}
                        className="border-slate-300 focus:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={cardForm.control}
                name="playerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-emerald-600" />
                      Númer
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Númer leikmanns"
                        {...field}
                        className="border-slate-300 focus:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={cardForm.control}
                name="minute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      Mínúta
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mínúta"
                        {...field}
                        className="border-slate-300 focus:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={cardForm.control}
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
                        className={`w-7 h-10 rounded hover:scale-105 cursor-pointer ${
                          field.value === 'Yellow' &&
                          'ring-2 ring-offset-2 ring-yellow-400 shadow-md scale-105'
                        }`}
                        onClick={() => cardForm.setValue('cardType', 'Yellow')}
                      >
                        <div className="w-7 h-10 bg-gradient-to-br from-yellow-300 to-amber-500 rounded shadow-sm"></div>
                      </div>

                      <div
                        className={`w-7 h-10 rounded flex items-center justify-center hover:scale-105 cursor-pointer ${
                          field.value === 'YellowRed' &&
                          'ring-2 ring-offset-3 ring-amber-500 shadow-md scale-105'
                        }`}
                        onClick={() =>
                          cardForm.setValue('cardType', 'YellowRed')
                        }
                      >
                        <div className="relative w-6 h-9 -mb-1.5 -ml-1.5">
                          <div className="absolute w-6 h-9 bg-gradient-to-br from-yellow-300 to-amber-500 rounded shadow-sm"></div>
                          <div className="absolute w-6 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded shadow-sm transform translate-x-1.5 -translate-y-1.5"></div>
                        </div>
                      </div>

                      <div
                        className={`w-7 h-10 rounded hover:scale-105 cursor-pointer ${
                          field.value === 'Red' &&
                          'ring-2 ring-offset-2 ring-red-500 shadow-md scale-105'
                        }`}
                        onClick={() => cardForm.setValue('cardType', 'Red')}
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
                      : 'Ekkert valið'}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={cardForm.handleSubmit(onSubmit)}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Bæta við <Plus className="mt-0.5" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
