-- Enable Supabase Realtime on key tables so the browser client receives
-- live postgres_changes events without polling.
--
-- These tables drive real-time UI updates:
--   golf_scores          → scorecard live view, dashboard score grid
--   winners              → subscriber winnings status transitions
--   winner_verifications → admin verification queue live arrivals
--   payouts              → subscriber payout status (pending → paid)

ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.winners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.winner_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payouts;
