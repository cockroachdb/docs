
--
-- PostgreSQL database dump
--

--
-- Name: customers; Type: TABLE; Schema: public; Owner: seanloiselle
--

CREATE TABLE customers (
    id integer PRIMARY KEY,
    name text
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: seanloiselle
--

CREATE TABLE accounts (
    customer_id integer REFERENCES customers(id),
    id integer PRIMARY KEY,
    balance numeric,
    CONSTRAINT accounts_balance_check CHECK ((balance > (0)::numeric))
);


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
-- PostgreSQL database dump complete
--

