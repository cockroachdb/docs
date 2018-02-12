CREATE TABLE customers (
    id integer PRIMARY KEY,
    name text
);

CREATE TABLE accounts (
    customer_id integer REFERENCES customers(id),
    id integer PRIMARY KEY,
    balance numeric,
    CONSTRAINT accounts_balance_check CHECK ((balance > (0)::numeric))
);

COPY customers (id, name) FROM stdin;
1       Bjorn Fairclough
2       Arturo Nevin
3       Naseem Joossens
4       Juno Studwick
5       Eutychia Roberts
\.

COPY accounts (customer_id, id, balance) FROM stdin;
1       1       100
2       2       200
3       3       200
4       4       400
5       5       200
\.
