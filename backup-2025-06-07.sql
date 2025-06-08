

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."bump_sort_order"("p_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update prompts
  set sort_order = nextval('prompts_sort_order_seq'),
      favorit    = false
  where id = p_id;
end; $$;


ALTER FUNCTION "public"."bump_sort_order"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_favorite_with_limit"("prompt_id" "uuid", "user_uuid" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  fav_cnt   int;
  new_order bigint;
begin

  select count(*) into fav_cnt
  from prompts
  where favorit = true
    and user_id = user_uuid;

  if fav_cnt >= 30 then
    return 'limit_reached';
  end if;

  select coalesce(min(sort_order),0) - 1
    into new_order
  from prompts;

  update prompts
  set favorit    = true,
      sort_order = new_order  
  where id = prompt_id;

  return 'success';
end; $$;


ALTER FUNCTION "public"."set_favorite_with_limit"("prompt_id" "uuid", "user_uuid" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chains" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."chains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'user'::"text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "description" "text",
    "is_public" boolean DEFAULT false,
    "inserted_at" timestamp without time zone DEFAULT "now"(),
    "category_id" "uuid",
    "favorit" boolean DEFAULT false NOT NULL,
    "next_prompt_id" "uuid",
    "color" "text" DEFAULT 'default'::"text",
    "sort_order" integer NOT NULL,
    "model_id" "uuid",
    "chain_id" "uuid",
    "chain_order" integer,
    CONSTRAINT "prompts_chain_order_check" CHECK ((("chain_order" >= 1) AND ("chain_order" <= 10)))
);


ALTER TABLE "public"."prompts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."prompts_sort_order_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."prompts_sort_order_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."prompts_sort_order_seq" OWNED BY "public"."prompts"."sort_order";



ALTER TABLE ONLY "public"."prompts" ALTER COLUMN "sort_order" SET DEFAULT "nextval"('"public"."prompts_sort_order_seq"'::"regclass");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chains"
    ADD CONSTRAINT "chains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_sort_order_key" UNIQUE ("sort_order");



CREATE UNIQUE INDEX "prompts_chain_unique" ON "public"."prompts" USING "btree" ("chain_id", "chain_order") WHERE ("chain_id" IS NOT NULL);



CREATE INDEX "prompts_search_idx" ON "public"."prompts" USING "gin" ("to_tsvector"('"simple"'::"regconfig", ((COALESCE("title", ''::"text") || ' '::"text") || COALESCE("content", ''::"text"))));



ALTER TABLE ONLY "public"."chains"
    ADD CONSTRAINT "chains_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."chains"("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_next_prompt_id_fkey" FOREIGN KEY ("next_prompt_id") REFERENCES "public"."prompts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_profiles_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete their own prompts" ON "public"."prompts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own prompts" ON "public"."prompts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own prompts" ON "public"."prompts" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own prompts" ON "public"."prompts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own or public prompts" ON "public"."prompts" FOR SELECT USING ((("is_public" = true) OR ("user_id" = "auth"."uid"())));



ALTER TABLE "public"."prompts" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."bump_sort_order"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."bump_sort_order"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bump_sort_order"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_favorite_with_limit"("prompt_id" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_favorite_with_limit"("prompt_id" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_favorite_with_limit"("prompt_id" "uuid", "user_uuid" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."chains" TO "anon";
GRANT ALL ON TABLE "public"."chains" TO "authenticated";
GRANT ALL ON TABLE "public"."chains" TO "service_role";



GRANT ALL ON TABLE "public"."models" TO "anon";
GRANT ALL ON TABLE "public"."models" TO "authenticated";
GRANT ALL ON TABLE "public"."models" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."prompts" TO "anon";
GRANT ALL ON TABLE "public"."prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."prompts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."prompts_sort_order_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."prompts_sort_order_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."prompts_sort_order_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
