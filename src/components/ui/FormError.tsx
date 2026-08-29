export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-brand-red bg-brand-red/10 border border-brand-red/30 rounded-xl px-4 py-2 text-sm font-medium animate-pop-in">
      {message}
    </p>
  );
}
