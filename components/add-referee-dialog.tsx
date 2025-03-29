import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gavel, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';

export const AddRefereeDialog = ({
  open = false,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [refereeName, setRefereeName] = useState('');

  const supabase = createClient();

  const handleSubmit = async () => {
    if (refereeName.trim()) {
      await supabase
        .from('Referees')
        .insert({ refereeName: refereeName.trim() });
      setRefereeName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-full flex rounded-sm bg-slate-50 mt-1"
        >
          Bæta við dómara <Plus className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="gap-1">
          <DialogTitle>Bæta við dómara</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="refereeName"
            className="flex items-center gap-1.5 mb-1"
          >
            <Gavel className="w-4 h-4 text-emerald-600" />
            Nafn
          </Label>
          <div className="flex gap-2">
            <Input
              id="refereeName"
              placeholder="Nafn dómara"
              value={refereeName}
              onChange={(e) => setRefereeName(e.target.value)}
            />
            <Button
              onClick={handleSubmit}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Bæta við <Plus className='mt-0.5'/>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
