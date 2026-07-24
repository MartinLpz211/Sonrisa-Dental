--
-- PostgreSQL database dump
--

\restrict 4Q8O9sUy70E2oOxlQZlZIHyNTWMqy2D0qp2s60lhilakWM9oGYhKCPJF8rNDbFs

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'PENDIENTE',
    'CONFIRMADA',
    'CANCELADA',
    'COMPLETADA',
    'REAGENDADA'
);


ALTER TYPE public."AppointmentStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    service_id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    start_time text NOT NULL,
    status public."AppointmentStatus" DEFAULT 'PENDIENTE'::public."AppointmentStatus" NOT NULL,
    notes text,
    handled_by_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: blacklisted_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blacklisted_tokens (
    id integer NOT NULL,
    token character varying(500) NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.blacklisted_tokens OWNER TO postgres;

--
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blacklisted_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blacklisted_tokens_id_seq OWNER TO postgres;

--
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blacklisted_tokens_id_seq OWNED BY public.blacklisted_tokens.id;


--
-- Name: clinic_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_settings (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    opening_hours text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clinic_settings OWNER TO postgres;

--
-- Name: clinic_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinic_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinic_settings_id_seq OWNER TO postgres;

--
-- Name: clinic_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinic_settings_id_seq OWNED BY public.clinic_settings.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    duration integer NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    phone text,
    birth_date timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    language text DEFAULT 'es'::text NOT NULL,
    notifications_enabled boolean DEFAULT true NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: blacklisted_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens ALTER COLUMN id SET DEFAULT nextval('public.blacklisted_tokens_id_seq'::regclass);


--
-- Name: clinic_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic_settings ALTER COLUMN id SET DEFAULT nextval('public.clinic_settings_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c22081d7-a2d5-4e72-a88e-19c51f30feb8	ce30b8a5d5893a731fb20bf788b4dd04c23056f0afaa890fd05d7445a3720008	2026-07-13 12:17:59.864877-06	20260713181759_init	\N	\N	2026-07-13 12:17:59.69119-06	1
7d3bccd9-c296-404a-8870-01d22e8b26da	f6d9af09170fd7a24d01d34516ef646a0054c7c8721bbadbda2e159f060ece7c	2026-07-13 12:41:39.412332-06	20260713184139_add_blacklisted_tokens	\N	\N	2026-07-13 12:41:39.290266-06	1
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, patient_id, service_id, date, start_time, status, notes, handled_by_id, created_at, updated_at) FROM stdin;
1	5	1	2026-07-15 00:00:00	16:30	PENDIENTE	hola	3	2026-07-14 22:03:32.37	2026-07-14 22:03:32.37
2	4	1	2026-07-16 00:00:00	10:00	PENDIENTE	\N	3	2026-07-14 22:04:42.807	2026-07-14 22:04:42.807
3	5	1	2026-07-31 00:00:00	15:00	REAGENDADA	\N	3	2026-07-14 22:05:13.962	2026-07-14 22:05:58.918
4	6	1	2026-07-16 00:00:00	15:00	REAGENDADA	\N	3	2026-07-15 00:12:36.573	2026-07-15 00:14:09.396
5	4	1	2026-07-25 00:00:00	12:00	PENDIENTE	hola	\N	2026-07-24 00:19:11.186	2026-07-24 00:19:11.186
6	2	2	2026-07-31 00:00:00	09:00	PENDIENTE	prueba	\N	2026-07-24 00:23:37.647	2026-07-24 00:23:37.647
7	2	2	2026-08-16 00:00:00	14:30	PENDIENTE	pilin	\N	2026-07-24 04:32:46.185	2026-07-24 04:32:46.185
\.


--
-- Data for Name: blacklisted_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blacklisted_tokens (id, token, expires_at, created_at) FROM stdin;
1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhbmFAdGVzdC5jb20iLCJyb2xlIjoiUEFDSUVOVEUiLCJpYXQiOjE3ODM5NjgzNDYsImV4cCI6MTc4NDA1NDc0Nn0.GPtStXmDuoH1v6KLIFMU6zDJK2XJTIVVhpyvbNfhhw4	2026-07-14 18:45:46	2026-07-13 18:46:14.374
2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4Mzk3NDA3NSwiZXhwIjoxNzg0MDYwNDc1fQ.MKcROs10p7N3N1cGVroIqND9RsW-P6u_1G1DIrnb2Jk	2026-07-14 20:21:15	2026-07-13 20:21:36.741
3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4Mzk3NDEwMCwiZXhwIjoxNzg0MDYwNTAwfQ.eoOUYmsvdHeu48AyN0VB_I1wswlEvyc_SOOn0uLylQw	2026-07-14 20:21:40	2026-07-13 20:22:01.952
4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4Mzk3NDIxNiwiZXhwIjoxNzg0MDYwNjE2fQ.u5uPXl-qc0fv5hRD11pvy3DIDL9gefd9cIyT9RbClVI	2026-07-14 20:23:36	2026-07-13 20:33:26.273
5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiUEFDSUVOVEUiLCJpYXQiOjE3ODM5NzQ4NjQsImV4cCI6MTc4NDA2MTI2NH0.T52qo3RBqG0kkMP_H4vOgxpDc2aRwEkws9zVsL-RLO8	2026-07-14 20:34:24	2026-07-13 20:35:13.265
6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODM5NzQ5MjAsImV4cCI6MTc4NDA2MTMyMH0.YSNIImyv4iho_2a9R_vvLXqHyaLBb5LWCiWnXt3yUIg	2026-07-14 20:35:20	2026-07-13 20:35:22.856
7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODM5NzQ5MjcsImV4cCI6MTc4NDA2MTMyN30.so4f6avIRiQ7umwkO58A3uoq1Vld1trOS_R1cf3wd88	2026-07-14 20:35:27	2026-07-13 20:35:29.127
8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4Mzk3NDkzMiwiZXhwIjoxNzg0MDYxMzMyfQ.buF3s6dJwfdhKrq_Omcm2nzFdnsWKDzG_YBWCruY4is	2026-07-14 20:35:32	2026-07-13 20:35:33.126
9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4Mzk4Mzg0NSwiZXhwIjoxNzg0MDcwMjQ1fQ.TkU8g2iuZITOFBsC6L3BPi-5hsYpVqqkiQffZRBWaLw	2026-07-14 23:04:05	2026-07-13 23:04:27.289
10	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4Mzk4NDAwNSwiZXhwIjoxNzg0MDcwNDA1fQ.ffJOs7MX0V_8dW0tfh0aJs22aQvRbdt8lRUN1wWKhgA	2026-07-14 23:06:45	2026-07-13 23:07:09.621
11	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODM5ODQwMzIsImV4cCI6MTc4NDA3MDQzMn0._APz2QZZLgVYBd3wipCvBMe6GuGNVeg-wcJ3e-i69hQ	2026-07-14 23:07:12	2026-07-13 23:07:14.761
12	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4Mzk4NDEyNiwiZXhwIjoxNzg0MDcwNTI2fQ.324F_Uksz0PSWtRoR20dfDlhqMvwsxnXWJ459Lw77rU	2026-07-14 23:08:46	2026-07-13 23:08:50.301
13	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtaWF1NTA2OUBnbWFpbC5jb20iLCJyb2xlIjoiUEFDSUVOVEUiLCJpYXQiOjE3ODM5ODQyMjEsImV4cCI6MTc4NDA3MDYyMX0.6PcnhTsCnptd4Ko9WgqEMdWpLkmcXU7ZeIQXLNT4_U8	2026-07-14 23:10:21	2026-07-14 00:56:45.431
14	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQwMTM1MjAsImV4cCI6MTc4NDA5OTkyMH0.qaDfDmatf34CrwXD4meuBw1-MuUdakCiwGla-KmbuMk	2026-07-15 07:18:40	2026-07-14 07:24:45.381
15	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQwMTM4OTQsImV4cCI6MTc4NDEwMDI5NH0.X_fc_HftUM92kROM-dbBUvDvgM8nKO1WZQ4rd58E2wY	2026-07-15 07:24:54	2026-07-14 07:25:25.934
16	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQwMTU2MzUsImV4cCI6MTc4NDEwMjAzNX0.KYSKga2jTO2flJr0KKD2c1ouv4wOuoNO9jG5qKeHmTo	2026-07-15 07:53:55	2026-07-14 16:55:42.836
17	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQwNTA0MDUsImV4cCI6MTc4NDEzNjgwNX0.k0oHXAQXGCHjYIxTJVQREZ2-oaDUzJkcoVa2Jar47u4	2026-07-15 17:33:25	2026-07-14 17:34:25.461
18	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQwNTA0OTUsImV4cCI6MTc4NDEzNjg5NX0.W6MeqnUUvCN70aJBUPU7jFxA6qc2UtqMJDNL0dGIffo	2026-07-15 17:34:55	2026-07-14 17:46:22.322
19	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDA1MTE4NiwiZXhwIjoxNzg0MTM3NTg2fQ.FTFYkAy7-BwTqsUuir7JjT8DqpwvRJbworMQJ2dboVg	2026-07-15 17:46:26	2026-07-14 17:46:27.722
20	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQwNTExOTEsImV4cCI6MTc4NDEzNzU5MX0.C2dCnbtN2lZ017h-FlOjxGoK4JdI8Y4wy8JTtkUR1I8	2026-07-15 17:46:31	2026-07-14 21:14:54.375
21	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQwNjM2OTksImV4cCI6MTc4NDE1MDA5OX0.yWavDtFyuZRiLBozraZXy14wQClAZu2eJlEtPPitcHA	2026-07-15 21:14:59	2026-07-14 22:06:37.728
22	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDA2NjgwMCwiZXhwIjoxNzg0MTUzMjAwfQ.FJoCbyOb1C_JZ8XYG-Khy22uM8gHdemkLRKHN4XJ6Q0	2026-07-15 22:06:40	2026-07-14 22:06:50.249
23	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQwNzQxMjAsImV4cCI6MTc4NDE2MDUyMH0.kEOyyUFUTdERjNS1Lqgjyxy_y9NVkdMP5iizb7QMDCw	2026-07-16 00:08:40	2026-07-15 00:10:52.417
24	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwb3JyYXNyMzNAeWFob28uY29tLm14Iiwicm9sZSI6IlBBQ0lFTlRFIiwiaWF0IjoxNzg0MDc0MzA1LCJleHAiOjE3ODQxNjA3MDV9.2hNEit1cAPx9hS0piyvhG9v5DwJucWkSZ9_5LSx34jk	2026-07-16 00:11:45	2026-07-15 00:11:53.625
25	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ2OTczMjQsImV4cCI6MTc4NDc4MzcyNH0.xdoDGGYhhvPHsLhOYDWfW1ki3s9yldpPx8jOlBJFkPk	2026-07-23 05:15:24	2026-07-22 05:16:12.688
26	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDY5NzQ1OCwiZXhwIjoxNzg0NzgzODU4fQ.9CwbEe5kM5UMzQ5CvAdg9nZaFp1PEbfv6gVh4312m0E	2026-07-23 05:17:38	2026-07-22 05:17:40.236
27	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ2OTc0NjcsImV4cCI6MTc4NDc4Mzg2N30.mj6jH63B0t78NrzTsLYqLAiqmM-AASJCBkDdh1JHRAE	2026-07-23 05:17:47	2026-07-22 05:17:58.353
28	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ2OTc0ODAsImV4cCI6MTc4NDc4Mzg4MH0.lZN0MyVpo6Y0c9rYQIbqgDf1em_E_fEmgwkYPcLejuE	2026-07-23 05:18:00	2026-07-22 05:25:52.509
29	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDY5Nzk1NiwiZXhwIjoxNzg0Nzg0MzU2fQ.hssSL3FC4k2xphAgaEhqAIfhUZHPKFPQ-1lX7cPre1s	2026-07-23 05:25:56	2026-07-22 05:26:03.599
30	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ2OTc5NzAsImV4cCI6MTc4NDc4NDM3MH0.qtyW70SsyP0WGDk2CrAygaqP1mnV54V1P-x18YX1Aa4	2026-07-23 05:26:10	2026-07-22 05:26:13.918
31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ2OTgxODQsImV4cCI6MTc4NDc4NDU4NH0.0e-VF-XWEZakPf5snMD-NymnPLStqLwF4szvxFdYc00	2026-07-23 05:29:44	2026-07-22 05:58:53.029
32	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDY5OTkzNiwiZXhwIjoxNzg0Nzg2MzM2fQ.EIS_jjTdKGwGfuD20o-SNQzPKEMfcp8JiGGgJUeXLvs	2026-07-23 05:58:56	2026-07-22 06:07:06.071
33	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDcwMTI3NywiZXhwIjoxNzg0Nzg3Njc3fQ.AhwLeBW7gVrnY-7jy1HaXZxHISeVN8Mkzinr6maDMoM	2026-07-23 06:21:17	2026-07-22 06:24:28.83
34	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ4NDk2ODcsImV4cCI6MTc4NDkzNjA4N30.7Q1beNtUToMHVN2daSAUi1R3T4QXbzp6DMj3HPy4Pv4	2026-07-24 23:34:47	2026-07-23 23:36:32.509
35	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ4NDk4MDEsImV4cCI6MTc4NDkzNjIwMX0.ilxIvvHAGEIo33_zuZ6UmPuGKGTfFgXY8XvEl2t_5H0	2026-07-24 23:36:41	2026-07-23 23:36:50.926
36	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ4NDk4MjEsImV4cCI6MTc4NDkzNjIyMX0.FRhiTZth8n3k4GdsQDZZ-Iv1Z0yGgVnSu-D5lwxYTlU	2026-07-24 23:37:01	2026-07-23 23:42:02.446
37	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ4NTAxMzQsImV4cCI6MTc4NDkzNjUzNH0.kH1SUF1U8el0H6SRHurENm_eFRR1pE8a9mFhXiaJc3Y	2026-07-24 23:42:14	2026-07-23 23:42:22.09
38	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDg1MDE0NSwiZXhwIjoxNzg0OTM2NTQ1fQ.KXKf5RyzDXgT48HJ08myNSI3Lzms4omRWfns1493hYU	2026-07-24 23:42:25	2026-07-23 23:48:08.662
39	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDg1MDQ5MCwiZXhwIjoxNzg0OTM2ODkwfQ.rPJZTf5yHyklxj3wj73TB6TvhKx9Jvdnjy1B3O1Dudw	2026-07-24 23:48:10	2026-07-23 23:48:11.865
40	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ4NTA0OTYsImV4cCI6MTc4NDkzNjg5Nn0.IsjFieyy4VS9fiI1hS5f-NGQe40ZoztOpIcMYPZafOM	2026-07-24 23:48:16	2026-07-23 23:48:46.547
41	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDg1MDUzMCwiZXhwIjoxNzg0OTM2OTMwfQ.i0LsZ59z0L-u0HrdyYhpO-8Bh3Nf2uXYq-6BHmPx3UE	2026-07-24 23:48:50	2026-07-23 23:50:50.1
42	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ4NTA2NTksImV4cCI6MTc4NDkzNzA1OX0.5kfuHnBRAaFeh7sZ4asJfszELJpl-s4RFNkG2UOC2hU	2026-07-24 23:50:59	2026-07-23 23:51:45.112
43	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDg1MDcwOSwiZXhwIjoxNzg0OTM3MTA5fQ.uhWBs85gqCEdI6n6tKmLbp5peGQ9ZZJG2QEBeMcdvBs	2026-07-24 23:51:49	2026-07-23 23:52:14.607
44	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtaWF1NTA2OUBnbWFpbC5jb20iLCJyb2xlIjoiUEFDSUVOVEUiLCJpYXQiOjE3ODQ4NTA3MzgsImV4cCI6MTc4NDkzNzEzOH0.Z6aGhMmQfUrPzxhl_f3kuxL6AhfBYLLSI-dn4hF7o9M	2026-07-24 23:52:18	2026-07-24 00:22:21.559
45	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtaWF1NTA2OUBnbWFpbC5jb20iLCJyb2xlIjoiUEFDSUVOVEUiLCJpYXQiOjE3ODQ4NTI1NDUsImV4cCI6MTc4NDkzODk0NX0.BBtByfXBv6xaIRha5pZJIcW0TQn7_hpZhqniSfmj8aA	2026-07-25 00:22:25	2026-07-24 00:22:59.768
46	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDg1MjU5NSwiZXhwIjoxNzg0OTM4OTk1fQ.RNVfXRDMErPAuUf195nk_8Ho6SXNCm_id_KF3zFs32E	2026-07-25 00:23:15	2026-07-24 00:50:40.238
47	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDg1NjI3MSwiZXhwIjoxNzg0OTQyNjcxfQ.5825GHBA7OGJdshZyU780mgRK_KHuh__F5FooS4oKAg	2026-07-25 01:24:31	2026-07-24 04:31:57.853
48	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwYXRvQGdtYWlsLmNvbSIsInJvbGUiOiJQQUNJRU5URSIsImlhdCI6MTc4NDg2NzUyOSwiZXhwIjoxNzg0OTUzOTI5fQ.GPpxC_3iDPqnFvze12oyRQbAzInmBdvfUVQS0zqh8aU	2026-07-25 04:32:09	2026-07-24 04:33:10.055
49	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODQ4Njc1OTUsImV4cCI6MTc4NDk1Mzk5NX0.jMhU94SLRnthxJ8bE8uXTVdggLY5OUUEOpMqB7Ku2sI	2026-07-25 04:33:15	2026-07-24 04:34:37.972
\.


--
-- Data for Name: clinic_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinic_settings (id, name, phone, address, opening_hours, updated_at) FROM stdin;
1	Sonrisas Dental			Lunes a Viernes 09:00 - 18:00	2026-07-22 05:55:44.71
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, "createdAt") FROM stdin;
1	ADMIN	2026-07-13 18:26:54.584
2	PACIENTE	2026-07-13 18:26:54.715
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, description, price, duration, image_url, is_active, created_at, updated_at) FROM stdin;
1	Limpieza dental profunda	Profilaxis y eliminación de sarro en consulta.	500.00	50	https://example.com/imagenes/limpieza.jpg	t	2026-07-14 17:03:15.446	2026-07-14 17:04:13.613
2	prueba	hola	500.00	30	\N	t	2026-07-23 23:48:40.055	2026-07-23 23:48:40.055
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, password, phone, birth_date, is_active, role_id, created_at, updated_at, language, notifications_enabled) FROM stdin;
1	Ana	Pérez	ana@test.com	$2b$10$1fqts6PaXWHw7vHTRcqeAusi7rQSmqHn1Fo/DhcWfCNH5QDHyxE0e	3312345678	\N	t	2	2026-07-13 18:45:31.115	2026-07-13 18:45:31.115	es	t
6	Ricardo	Porras	porrasr33@yahoo.com.mx	$2b$10$2kfNbO5o3vTnbw0r8tSBZe/XyZ0RdJOoiltUH86F/DqOGSSZZTaxG	4426602606	\N	t	2	2026-07-15 00:11:45.319	2026-07-15 00:11:45.319	es	t
5	Eva	Gonzalez	ava@example.com	$2b$10$RgDXiJNJLJxuJ4oQQdz99uCmsq2U2kfvX8lvTsEy5CyCXIAipHxAC	5559999999	\N	t	2	2026-07-14 07:24:15.697	2026-07-15 00:14:35.516	es	t
3	Lilian	Lugo	admin@gmail.com	$2b$10$wIJxw6v56EFBdy6UroCWg.UEM3JhKlVLpazl.usjPiwWpxCVYea0m		2006-02-05 00:00:00	t	1	2026-07-13 20:34:24.205	2026-07-23 23:35:29.417	es	t
2	Martin	Lopez	pato@gmail.com	$2b$10$BUpzTDHjY0qOsof4wDhFMOM5tJrmt0tfpFlSVmClZ8wH5lESsMF2u	4421300183	\N	t	2	2026-07-13 20:21:15.321	2026-07-23 23:42:20.333	es	t
4	miau	5069	miau5069@gmail.com	$2b$10$FtiN2AK0oUc3iuZQnYG.0u53SNEu4jdVUJ5wzDx.MSVwXSEM0cUyG	4461283884	2005-06-10 00:00:00	t	2	2026-07-13 23:10:20.989	2026-07-23 23:53:05.269	es	t
\.


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 7, true);


--
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blacklisted_tokens_id_seq', 49, true);


--
-- Name: clinic_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clinic_settings_id_seq', 1, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: blacklisted_tokens blacklisted_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_pkey PRIMARY KEY (id);


--
-- Name: clinic_settings clinic_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic_settings
    ADD CONSTRAINT clinic_settings_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: appointments_date_start_time_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX appointments_date_start_time_key ON public.appointments USING btree (date, start_time);


--
-- Name: blacklisted_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blacklisted_tokens_token_key ON public.blacklisted_tokens USING btree (token);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: appointments appointments_handled_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_handled_by_id_fkey FOREIGN KEY (handled_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 4Q8O9sUy70E2oOxlQZlZIHyNTWMqy2D0qp2s60lhilakWM9oGYhKCPJF8rNDbFs

