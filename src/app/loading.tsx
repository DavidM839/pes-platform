import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-navy-300">
        <Loader2 className="h-7 w-7 animate-spin" aria-hidden />
        <p className="text-sm">Cargando...</p>
      </div>
    </div>
  );
}
