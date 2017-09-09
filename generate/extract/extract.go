package extract

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"regexp"
	"strings"
	"sync"
	"unicode"

	"github.com/cockroachdb/docs/generate/yacc"
)

const (
	rrAddr = "http://bottlecaps.de/rr/ui"
)

var (
	reIsExpr  = regexp.MustCompile("^[a-z_]+$")
	reIsIdent = regexp.MustCompile("^[A-Z_0-9]+$")
	rrLock    sync.Mutex
)

func GenerateRRJar(jar string, bnf []byte) ([]byte, error) {
	// Note: the RR generator is already multithreaded.  The
	// -max-workers setting at the toplevel is probably already
	// optimally set to 1.

	// JAR generation is enabled by placing Railroad.jar (ask mjibson for a link)
	// in the generate directory.
	cmd := exec.Command(
		"java",
		"-jar", jar,
		"-suppressebnf",
		"-color:#ffffff",
		"-width:760",
		"-")
	cmd.Stdin = bytes.NewReader(bnf)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("%s: %s", err, out)
	}
	return out, nil
}

// generates the RR XHTML from a EBNF file
func GenerateRRNet(bnf []byte) ([]byte, error) {
	rrLock.Lock()
	defer rrLock.Unlock()

	v := url.Values{}
	v.Add("color", "#ffffff")
	v.Add("frame", "diagram")
	//v.Add("options", "suppressebnf")
	v.Add("text", string(bnf))
	v.Add("width", "760")
	v.Add("options", "eliminaterecursion")
	v.Add("options", "factoring")
	v.Add("options", "inline")

	resp, err := http.Post(rrAddr, "application/x-www-form-urlencoded", strings.NewReader(v.Encode()))
	if err != nil {
		return nil, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%s: %s", resp.Status, string(body))
	}
	return body, nil
}

// Opens or downloads the .y file at addr and returns at as an EBNF
// file. Unimplemented branches are removed. Resulting empty nodes and their
// uses are further removed. Empty nodes are elided.
func GenerateBNF(addr string) (ebnf []byte, err error) {
	b, err := ioutil.ReadFile(addr)
	if err != nil {
		resp, err := http.Get(addr)
		if err != nil {
			return nil, err
		}
		b, err = ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		resp.Body.Close()
	}
	t, err := yacc.Parse(addr, string(b))
	if err != nil {
		return nil, err
	}
	buf := new(bytes.Buffer)

	// Remove unimplemented branches.
	prods := make(map[string][][]yacc.Item)
	for _, p := range t.Productions {
		var impl [][]yacc.Item
		for _, e := range p.Expressions {
			if strings.Contains(e.Command, "unimplemented") {
				continue
			}
			if strings.Contains(e.Command, "SKIP DOC") {
				continue
			}
			impl = append(impl, e.Items)
		}
		prods[p.Name] = impl
	}
	// Cascade removal of empty nodes. That is, for any node that has no branches,
	// remove it and anything it refers to.
	for {
		changed := false
		for name, exprs := range prods {
			var next [][]yacc.Item
			for _, expr := range exprs {
				add := true
				var items []yacc.Item
				for _, item := range expr {
					p := prods[item.Value]
					if item.Typ == yacc.TypToken && !isUpper(item.Value) && len(p) == 0 {
						add = false
						changed = true
						break
					}
					// Remove items that have one branch which accepts nothing.
					if len(p) == 1 && len(p[0]) == 0 {
						changed = true
						continue
					}
					items = append(items, item)
				}
				if add {
					next = append(next, items)
				}
			}
			prods[name] = next
		}
		if !changed {
			break
		}
	}

	start := true
	for _, prod := range t.Productions {
		p := prods[prod.Name]
		if len(p) == 0 {
			continue
		}
		if start {
			start = false
		} else {
			buf.WriteString("\n")
		}
		fmt.Fprintf(buf, "%s ::=\n", prod.Name)
		for i, items := range p {
			buf.WriteString("\t")
			if i > 0 {
				buf.WriteString("| ")
			}
			for j, item := range items {
				if j > 0 {
					buf.WriteString(" ")
				}
				buf.WriteString(item.Value)
			}
			buf.WriteString("\n")
		}
	}
	return buf.Bytes(), nil
}

func isUpper(s string) bool {
	return s == strings.ToUpper(s)
}

// Parser the grammar from b.
func ParseGrammar(r io.Reader) (Grammar, error) {
	g := make(Grammar)

	var name string
	var prods Productions
	scan := bufio.NewScanner(r)
	i := 0
	for scan.Scan() {
		s := scan.Text()
		i++
		f := strings.Fields(s)
		if len(f) == 0 {
			if len(prods) > 0 {
				g[name] = prods
			}
			continue
		}
		if !unicode.IsSpace(rune(s[0])) {
			if len(f) != 2 {
				return nil, fmt.Errorf("bad line: %v: %s", i, s)
			}
			name = f[0]
			prods = nil
			continue
		}
		if f[0] == "|" {
			f = f[1:]
		}
		var seq Sequence
		for _, v := range f {
			if reIsIdent.MatchString(v) {
				seq = append(seq, Literal(v))
			} else if reIsExpr.MatchString(v) {
				seq = append(seq, Token(v))
			} else if strings.HasPrefix(v, `'`) && strings.HasSuffix(v, `'`) {
				seq = append(seq, Literal(v[1:len(v)-1]))
			} else if strings.HasPrefix(v, `/*`) && strings.HasSuffix(v, `*/`) {
				seq = append(seq, Comment(v))
			} else {
				panic(v)
			}
		}
		prods = append(prods, seq)
	}
	if err := scan.Err(); err != nil {
		return nil, err
	}
	if len(prods) > 0 {
		g[name] = prods
	}
	g.Simplify()
	return g, nil
}

type Grammar map[string]Productions

// ExtractProduction extracts the named statement and all its dependencies,
// in order, into a BNF file. If descend is false, only the named statement
// is extracted.
func (g Grammar) ExtractProduction(name string, descend, nosplit bool, match, exclude []*regexp.Regexp) ([]byte, error) {
	names := []Token{Token(name)}
	b := new(bytes.Buffer)
	done := map[Token]bool{Token(name): true}
	for i := 0; i < len(names); i++ {
		if i > 0 {
			b.WriteString("\n")
		}
		n := names[i]
		prods := g[string(n)]
		if len(prods) == 0 {
			return nil, fmt.Errorf("couldn't find %s", n)
		}
		WalkToken(prods, func(t Token) {
			if !done[t] && descend {
				names = append(names, t)
				done[t] = true
			}
		})
		fmt.Fprintf(b, "%s ::=\n", n)
		b.WriteString(prods.Match(nosplit, match, exclude))
	}
	return b.Bytes(), nil
}

func (g Grammar) Inline(names ...string) error {
	for _, name := range names {
		fmt.Fprintf(os.Stderr, "replacing %q...\n", name)
		p, ok := g[name]
		if !ok {
			return fmt.Errorf("unknown name: %s", name)
		}
		grp := Group(p)
		for _, prods := range g {
			ReplaceToken(prods, func(t Token) Expression {
				if string(t) == name {
					return grp
				}
				return nil
			})
		}
	}
	return nil
}

func (g Grammar) Simplify() {
	for name, prods := range g {
		p := Simplify(name, prods)
		if p != nil {
			g[name] = p
		}
	}
}

func Simplify(name string, prods Productions) Productions {
	funcs := []func(string, Productions) Productions{
		simplifySelfRefList,
	}
	for _, f := range funcs {
		if e := f(name, prods); e != nil {
			return e
		}
	}
	return nil
}

func simplifySelfRefList(name string, prods Productions) Productions {
	// First check we have sequences everywhere, and that the production
	// is a prefix of at least one of them.
	// Split the sequences in leaf and recursive groups:
	// X := A | B | X C | X D
	// Group 1: A | B
	// Group 2: C | D
	// Final: (A | B) (C | D)*
	var group1, group2 Group
	for _, p := range prods {
		s, ok := p.(Sequence)
		if !ok {
			return nil
		}
		if len(s) > 0 && s[0] == Token(name) {
			group2 = append(group2, Sequence(s[1:]))
		} else {
			group1 = append(group1, s)
		}
	}
	if len(group2) == 0 {
		// Not a recursive rule; do nothing.
		return nil
	}
	return Productions{
		Sequence{group1, Repeat{group2}},
	}
}

func ReplaceToken(p Productions, f func(Token) Expression) {
	replaceToken(p, f)
}

func replaceToken(e Expression, f func(Token) Expression) Expression {
	switch e := e.(type) {
	case Sequence:
		for i, v := range e {
			n := replaceToken(v, f)
			if n != nil {
				e[i] = n
			}
		}
	case Token:
		return f(e)
	case Group:
		for i, v := range e {
			n := replaceToken(v, f)
			if n != nil {
				e[i] = n
			}
		}
	case Productions:
		for i, v := range e {
			n := replaceToken(v, f)
			if n != nil {
				e[i] = n
			}
		}
	case Repeat:
		return replaceToken(e.Expression, f)
	case Literal, Comment:
		// ignore
	default:
		panic(fmt.Errorf("unknown type: %T", e))
	}
	return nil
}

func WalkToken(e Expression, f func(Token)) {
	switch e := e.(type) {
	case Sequence:
		for _, v := range e {
			WalkToken(v, f)
		}
	case Token:
		f(e)
	case Group:
		for _, v := range e {
			WalkToken(v, f)
		}
	case Repeat:
		WalkToken(e.Expression, f)
	case Productions:
		for _, v := range e {
			WalkToken(v, f)
		}
	case Literal, Comment:
		// ignore
	default:
		panic(fmt.Errorf("unknown type: %T", e))
	}
}

type Productions []Expression

func (p Productions) Match(nosplit bool, match, exclude []*regexp.Regexp) string {
	b := new(bytes.Buffer)
	first := true
	for _, e := range p {
		if nosplit {
			b.WriteString("\t")
			if !first {
				b.WriteString("| ")
			} else {
				first = false
			}
			b.WriteString(e.String())
			b.WriteString("\n")
			continue
		}
	Loop:
		for _, s := range split(e) {
			for _, ex := range exclude {
				if ex.MatchString(s) {
					continue Loop
				}
			}
			for _, ma := range match {
				if !ma.MatchString(s) {
					continue Loop
				}
			}
			b.WriteString("\t")
			if !first {
				b.WriteString("| ")
			} else {
				first = false
			}
			b.WriteString(s)
			b.WriteString("\n")
		}
	}
	return b.String()
}

func (p Productions) String() string {
	b := new(bytes.Buffer)
	for i, e := range p {
		b.WriteString("\t")
		if i > 0 {
			b.WriteString("| ")
		}
		b.WriteString(e.String())
		b.WriteString("\n")
	}
	return b.String()
}

type Expression interface {
	String() string
}

type Sequence []Expression

func (s Sequence) String() string {
	b := new(bytes.Buffer)
	for i, e := range s {
		if i > 0 {
			b.WriteString(" ")
		}
		b.WriteString(e.String())
	}
	return b.String()
}

type Token string

func (t Token) String() string {
	return string(t)
}

type Literal string

func (l Literal) String() string {
	return fmt.Sprintf("'%s'", string(l))
}

type Group []Expression

func (g Group) String() string {
	b := new(bytes.Buffer)
	b.WriteString("( ")
	for i, e := range g {
		if i > 0 {
			b.WriteString(" | ")
		}
		b.WriteString(e.String())
	}
	b.WriteString(" )")
	return b.String()
}

type Repeat struct {
	Expression
}

func (r Repeat) String() string {
	return fmt.Sprintf("( %s )*", r.Expression)
}

type Comment string

func (c Comment) String() string {
	return string(c)
}

func split(e Expression) []string {
	appendRet := func(cur, add []string) []string {
		if len(cur) == 0 {
			if len(add) == 0 {
				return []string{""}
			}
			return add
		}
		var next []string
		for _, r := range cur {
			for _, s := range add {
				next = append(next, r+" "+s)
			}
		}
		return next
	}
	var ret []string
	switch e := e.(type) {
	case Sequence:
		for _, v := range e {
			ret = appendRet(ret, split(v))
		}
	case Group:
		var next []string
		for _, v := range e {
			next = append(next, appendRet(ret, split(v))...)
		}
		ret = next
	case Literal, Comment, Repeat, Token:
		ret = append(ret, e.String())
	default:
		panic(fmt.Errorf("unknown type: %T", e))
	}
	return ret
}
