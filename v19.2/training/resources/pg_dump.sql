--
-- PostgreSQL database dump
--

-- Dumped from database version 10.1
-- Dumped by pg_dump version 10.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: test; Type: SCHEMA; Schema: -; Owner: seanloiselle
--

CREATE SCHEMA test;


ALTER SCHEMA test OWNER TO seanloiselle;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: seanloiselle
--

CREATE TABLE accounts (
    customer_id integer,
    id integer NOT NULL,
    balance numeric,
    CONSTRAINT accounts_balance_check CHECK ((balance > (0)::numeric))
);


ALTER TABLE accounts OWNER TO seanloiselle;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: seanloiselle
--

CREATE TABLE customers (
    id integer NOT NULL,
    name text
);


ALTER TABLE customers OWNER TO seanloiselle;

--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: seanloiselle
--

COPY accounts (customer_id, id, balance) FROM stdin;
1	1	100
2	2	200
3	3	200
4	4	400
5	5	200
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: seanloiselle
--

COPY customers (id, name) FROM stdin;
1	Bjorn Fairclough
2	Arturo Nevin
3	Naseem Joossens
4	Juno Studwick
5	Eutychia Roberts
\.


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: seanloiselle
--

ALTER TABLE ONLY accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: seanloiselle
--

ALTER TABLE ONLY customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: seanloiselle
--

ALTER TABLE ONLY accounts
    ADD CONSTRAINT accounts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);


--
-- PostgreSQL database dump complete
--

