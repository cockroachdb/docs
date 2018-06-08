import argparse
import psycopg2
import time

parser = argparse.ArgumentParser(
    description="test performance of statements against movr database")
parser.add_argument("--host", required=True,
    help="ip address of one of the CockroachDB nodes")
parser.add_argument("--statement", required=True,
    help="statement to execute")
parser.add_argument("--repeat",
    help="number of times to repeat the statement", default = 20)
parser.add_argument("--times",
    help="print time for each repetition of the statement", action="store_true")
parser.add_argument("--cumulative",
    help="print cumulative time for all repetitions of the statement", action="store_true")
args = parser.parse_args()

conn = psycopg2.connect(database='movr', user='root', host=args.host, port=26257)
conn.set_session(autocommit=True)
cur = conn.cursor()

times = list()
count = 0
for n in range(int(args.repeat)):
    start = time.time()
    statement = args.statement
    cur.execute(statement)
    if count < 1:
        try:
            colnames = [desc[0] for desc in cur.description]
            print("")
            print("Result:")
            print(colnames)
            rows = cur.fetchall()
            for row in rows:
                print([str(cell) for cell in row])
        except Exception as e:
            pass
    end = time.time()
    times.append(end - start)
    count += 1

cur.close()
conn.close()

print("")
if args.times:
    print("Times (seconds):")
    print(times)
    print("")
print("Average time (seconds):")
print(float(sum(times))/len(times))
print("")
if args.cumulative:
    print("Cumulative time (seconds):")
    print(sum(times))
    print("")
