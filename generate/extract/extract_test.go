package extract

import (
	"fmt"
	"strings"
	"testing"
)

func TestSplitGroup(t *testing.T) {
	g, err := ParseGrammar(strings.NewReader(`
a ::=
	'A' b

b ::=
	c
	| b ',' c

c ::=
	'B'
	| 'C'
`))
	if err != nil {
		t.Fatal(err)
	}
	if err := g.Inline("b", "c", "opt_d"); err != nil {
		t.Fatal(err)
	}
	b, err := g.ExtractProduction("a", true, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(string(b))
}

func TestSplitOpt(t *testing.T) {
	g, err := ParseGrammar(strings.NewReader(`
a ::=
	'A' b

b ::=
	'B'
	|
`))
	if err != nil {
		t.Fatal(err)
	}
	if err := g.Inline("b"); err != nil {
		t.Fatal(err)
	}
	b, err := g.ExtractProduction("a", true, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(string(b))
}
