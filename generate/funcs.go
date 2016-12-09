package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"github.com/cockroachdb/cockroach/pkg/sql/parser"
	"github.com/spf13/cobra"
)

func init() {
	cmdFuncs = &cobra.Command{
		Use:   "funcs",
		Short: "Generates functions.md and operators.md",
		Run: func(cmd *cobra.Command, args []string) {
			generateFuncs()
		},
	}
}

func generateFuncs() {
	outDir := filepath.Join("..", "_includes", "sql")
	if err := ioutil.WriteFile(filepath.Join(outDir, "functions.md"), GenerateFunctions(parser.Builtins, true), 0644); err != nil {
		panic(err)
	}
	if err := ioutil.WriteFile(filepath.Join(outDir, "aggregates.md"), GenerateFunctions(parser.Aggregates, false), 0644); err != nil {
		panic(err)
	}
	if err := ioutil.WriteFile(filepath.Join(outDir, "operators.md"), GenerateOperators(), 0644); err != nil {
		panic(err)
	}
}

type operation struct {
	left  string
	right string
	ret   string
	op    string
}

func (o operation) String() string {
	if o.right == "" {
		return fmt.Sprintf("`%s`%s", o.op, linkType(o.left))
	}
	return fmt.Sprintf("%s `%s` %s", linkType(o.left), o.op, linkType(o.right))
}

type operations []operation

func (p operations) Len() int      { return len(p) }
func (p operations) Swap(i, j int) { p[i], p[j] = p[j], p[i] }
func (p operations) Less(i, j int) bool {
	if p[i].right != "" && p[j].right == "" {
		return false
	}
	if p[i].right == "" && p[j].right != "" {
		return true
	}
	if p[i].left != p[j].left {
		return p[i].left < p[j].left
	}
	if p[i].right != p[j].right {
		return p[i].right < p[j].right
	}
	return p[i].ret < p[j].ret
}

func GenerateOperators() []byte {
	ops := make(map[string]operations)
	for optyp, overloads := range parser.UnaryOps {
		op := optyp.String()
		for _, v := range overloads {
			ops[op] = append(ops[op], operation{
				left: v.Typ.String(),
				ret:  v.ReturnType.String(),
				op:   op,
			})
		}
	}
	for optyp, overloads := range parser.BinOps {
		op := optyp.String()
		for _, v := range overloads {
			left := v.LeftType.String()
			right := v.RightType.String()
			ops[op] = append(ops[op], operation{
				left:  left,
				right: right,
				ret:   v.ReturnType.String(),
				op:    op,
			})
		}
	}
	for optyp, overloads := range parser.CmpOps {
		op := optyp.String()
		for _, v := range overloads {
			left := v.LeftType.String()
			right := v.RightType.String()
			ops[op] = append(ops[op], operation{
				left:  left,
				right: right,
				ret:   "bool",
				op:    op,
			})
		}
	}
	var opstrs []string
	for k, v := range ops {
		sort.Sort(v)
		opstrs = append(opstrs, k)
	}
	sort.Strings(opstrs)
	b := new(bytes.Buffer)
	for _, op := range opstrs {
		fmt.Fprintf(b, "`%s` | Return\n", op)
		fmt.Fprintf(b, "--- | ---\n")
		for _, v := range ops[op] {
			fmt.Fprintf(b, "%s | %s\n", v.String(), linkType(v.ret))
		}
		fmt.Fprintln(b)
	}
	return b.Bytes()
}

func GenerateFunctions(from map[string][]parser.Builtin, categorize bool) []byte {
	functions := make(map[string][]string)
	seen := make(map[string]struct{})
	for name, fns := range from {
		// NB: funcs can appear more than once i.e. upper/lowercase varients for
		// faster lookups, so normalize to lowercase and de-dupe using a set.
		name = strings.ToLower(name)
		if _, ok := seen[name]; ok {
			continue
		}
		seen[name] = struct{}{}
		for _, fn := range fns {
			if categorize && fn.WindowFunc != nil {
				continue
			}
			args := fn.Types.String()
			ret := fn.ReturnType.String()
			cat := ret
			if c := fn.Category(); c != "" {
				cat = c
			}
			if !categorize {
				cat = ""
			}
			extra := ""
			if fn.Info != "" {
				extra = fmt.Sprintf(" <br /> <span class=\"desc\">%s</span>", fn.Info)
			}
			s := fmt.Sprintf("<code>%s(%s)</code>%s | %s", name, linkType(args), extra, linkType(ret))
			functions[cat] = append(functions[cat], s)
		}
	}
	var cats []string
	for k, v := range functions {
		sort.Strings(v)
		cats = append(cats, k)
	}
	sort.Strings(cats)
	// HACK: swap "Compatibility" to be last.
	// TODO(dt): Break up generated list be one _include per category, to allow
	// manually written copy on some sections.
	for i, cat := range cats {
		if cat == "Compatibility" {
			cats = append(append(cats[:i], cats[i+1:]...), "Compatibility")
			break
		}
	}
	b := new(bytes.Buffer)
	for _, cat := range cats {
		if categorize {
			fmt.Fprintf(b, "### %s Functions\n\n", cat)
		}
		fmt.Fprintln(b, "Function | Return")
		b.WriteString("--- | ---\n")
		b.WriteString(strings.Join(functions[cat], "\n"))
		b.WriteString("\n\n")
	}
	return b.Bytes()
}

var linkRE = regexp.MustCompile("[a-z]+")

func linkType(t string) string {
	return linkRE.ReplaceAllStringFunc(t, func(s string) string {
		name := s
		switch s {
		case "timestamptz":
			s = "timestamp"
		}
		switch s {
		case "int", "decimal", "float", "bool", "date", "timestamp", "interval", "string", "bytes":
			return fmt.Sprintf("<a href=\"%s.html\">%s</a>", s, name)
		}
		return s
	})
}
