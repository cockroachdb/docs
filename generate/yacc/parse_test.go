package yacc

import (
	"io/ioutil"
	"testing"
)

const name = "../../../cockroach/pkg/sql/parser/sql.y"

func TestLex(t *testing.T) {
	b, err := ioutil.ReadFile(name)
	if err != nil {
		t.Fatal(err)
	}
	l := lex(name, string(b))
Loop:
	for {
		item := l.nextItem()
		switch item.typ {
		case itemEOF:
			break Loop
		case itemError:
			t.Fatalf("%s:%d: %s", name, l.lineNumber(), item)
		}
	}
}

func TestParse(t *testing.T) {
	b, err := ioutil.ReadFile(name)
	if err != nil {
		t.Fatal(err)
	}
	_, err = Parse(name, string(b))
	if err != nil {
		t.Fatal(err)
	}
}
