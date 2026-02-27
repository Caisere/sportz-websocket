DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commentary') THEN
    ALTER TABLE "public"."commentary" RENAME TO "commentaries";
    ALTER TABLE "public"."commentaries" DROP CONSTRAINT IF EXISTS "commentary_match_id_matches_id_fk";
    ALTER TABLE "public"."commentaries" ADD CONSTRAINT "commentaries_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commentaries') THEN
    CREATE TABLE "commentaries" (
      "id" serial PRIMARY KEY NOT NULL,
      "match_id" integer NOT NULL,
      "minute" integer,
      "sequence" integer,
      "period" text,
      "event_type" text,
      "actor" text,
      "team" text,
      "message" text NOT NULL,
      "metadata" jsonb,
      "tags" text[],
      "createdAt" timestamp DEFAULT now() NOT NULL
    );
    ALTER TABLE "public"."commentaries" ADD CONSTRAINT "commentaries_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;