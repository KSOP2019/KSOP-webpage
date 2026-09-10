-- KSOP ranking design QA synthetic dataset
-- Creates 100 synthetic test players and their results safely.
-- Uses slug prefix test-player-001 ... test-player-100

DO $$ BEGIN
  -- Skip if already populated
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE slug LIKE 'test-player-%') THEN
    INSERT INTO public.players (id, slug, name, display_name, country, portrait_url, rank, points, earnings, titles, final_tables, bio, status, sort_order, created_at, updated_at)
    SELECT
      gen_random_uuid(),
      'test-player-' || lp.pad_num,
      'AIDEN ' || lp.pad_num,
      'AIDEN ' || lp.pad_num,
      (ARRAY['KR','JP','CN','US','CA','UK','FR','DE','AU','SG','TW','HK','TH','VN','PH'])[(lp.num % 15) + 1],
      '',
      lp.num,
      0,
      15000000 + (101 - lp.num) * 180000,
      11 - (lp.num / 10),
      13 - (lp.num / 8),
      'Synthetic test player #' || lp.num || ' for ranking design QA.',
      'published',
      lp.num,
      now(),
      now()
    FROM generate_series(1, 100) AS lp(num)
    CROSS JOIN LATERAL (SELECT lpad(lp.num::text, 3, '0') AS pad_num) AS sub;
  END IF;
END $$;

-- Insert sample results for synthetic players (basic loop approach)
DO $$ BEGIN
  -- For each synthetic player, insert 8-18 results using existing event slugs
  FOR r IN 1..100 LOOP
    INSERT INTO public.player_results (player_id, event_id, event_name, event_date, position, field_size, buy_in, earnings, created_at)
    SELECT
      p.id,
      (ARRAY['event-1','event-2','event-3','event-4','event-5','event-6','event-7','event-8','event-9','event-10'])[mod(r-1,10)+1],
      CASE WHEN r % 10 = 1 THEN 'Main Event Day 1' ELSE 'NLH Poker Players Championship / Day ' || (r % 5 + 1) || 'A' END,
      'NOV ' || (17 + (r % 5)),
      CASE WHEN r % 10 = 1 THEN 1 ELSE (r % 20) + 2 END,
      100 + (r % 10) * 50,
      CASE WHEN r % 5 = 0 THEN 50000 ELSE 10000 END,
      CASE WHEN r % 10 = 1 THEN 500000 + (r % 5) * 200000 ELSE 0 END,
      now()
    FROM public.players p
    WHERE p.slug LIKE 'test-player-%'
      AND p.slug = 'test-player-' || lpad(r::text, 3, '0');
  END LOOP;
END $$;
