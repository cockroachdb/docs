#!/usr/bin/env python

import argparse
import psycopg2
import time

parser = argparse.ArgumentParser(
    description="test performance of statements against movr database")
parser.add_argument("--host", required=True,
    help="ip address of one of the CockroachDB nodes")
parser.add_argument("--statement", required=True,
    help="statement to execute")
parser.add_argument("--repeat", type=int,
    help="number of times to repeat the statement", default = 20)
parser.add_argument("--times",
    help="print time for each repetition of the statement", action="store_true")
parser.add_argument("--cumulative",
    help="print cumulative time for all repetitions of the statement", action="store_true")
args = parser.parse_args()

conn = psycopg2.connect(
    database='movr',
    user='root',
    host=args.host,
    port=26257,
    sslmode='require',
    sslrootcert='certs/ca.crt',
    sslkey='certs/client.root.key',
    sslcert='certs/client.root.crt'
)
conn.set_session(autocommit=True)
cur = conn.cursor()

def median(lst):
    n = len(lst)
    if n < 1:
        return None
    if n % 2 == 1:
        return sorted(lst)[n//2]
    else:
        return sum(sorted(lst)[n//2-1:n//2+1])/2.0

times = list()
for n in range(args.repeat):
    start = time.time()
    statement = args.statement
    cur.execute(statement)
    if n < 1:
        if cur.description is not None:
            colnames = [desc[0] for desc in cur.description]
            print("")
            print("Result:")
            print(colnames)
            rows = cur.fetchall()
            for row in rows:
                print([str(cell) for cell in row])
    end = time.time()
    times.append((end - start)* 1000)

cur.close()
conn.close()

print("")
if args.times:
    print("Times (milliseconds):")
    print(times)
    print("")
# print("Average time (milliseconds):")
# print(float(sum(times))/len(times))
# print("")
print("Median time (milliseconds):")
print(median(times))
print("")
if args.cumulative:
    print("Cumulative time (milliseconds):")
    print(sum(times))
    print("")
