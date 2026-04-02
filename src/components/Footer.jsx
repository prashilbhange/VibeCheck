export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pb-8 pt-10 text-sm text-white/50 sm:px-6 lg:px-8">
      <p data-testid="footer-primary-text">Built for the vibe.</p>
      <p className="text-right" data-testid="footer-secondary-text">
        Rate it. Post it. Own it.
      </p>
    </footer>
  );
}