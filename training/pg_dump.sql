--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.1
-- Dumped by pg_dump version 9.6.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: store; Type: SCHEMA; Schema: -; Owner: maxroach
--

CREATE SCHEMA store;


ALTER SCHEMA store OWNER TO maxroach;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = store, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: customers; Type: TABLE; Schema: store; Owner: maxroach
--

CREATE TABLE customers (
    id integer NOT NULL,
    name text
);


ALTER TABLE customers OWNER TO maxroach;

--
-- Data for Name: customers; Type: TABLE DATA; Schema: store; Owner: maxroach
--

COPY customers (id, name) FROM stdin;
1	Bjorn Fairclough
2	Arturo Nevin
3	Naseem Joossens
4	Juno Studwick
5	Eutychia Roberts
6	Ricarda Moriarty
7	Henrik Brankovic
8	Raniya Žitnik
9	Yevhen Accorsi
\.


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: store; Owner: maxroach
--

ALTER TABLE ONLY customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

