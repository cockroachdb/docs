package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"reflect"
	"sort"
	"strings"

	"github.com/cockroachdb/cockroach/sql/parser"
)

func generateFuncs() {
	outDir := filepath.Join("..", "_includes", "sql")
	if err := ioutil.WriteFile(filepath.Join(outDir, "functions.md"), GenerateFunctions(parser.Builtins), 0644); err != nil {
		panic(err)
	}
	if err := ioutil.WriteFile(filepath.Join(outDir, "aggregates.md"), GenerateFunctions(parser.Aggregates), 0644); err != nil {
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
				left: v.Typ.Type(),
				ret:  v.ReturnType.Type(),
				op:   op,
			})
		}
	}
	for optyp, overloads := range parser.BinOps {
		op := optyp.String()
		for _, v := range overloads {
			left := v.LeftType.Type()
			right := v.RightType.Type()
			ops[op] = append(ops[op], operation{
				left:  left,
				right: right,
				ret:   v.ReturnType.Type(),
				op:    op,
			})
		}
	}
	for optyp, overloads := range parser.CmpOps {
		op := optyp.String()
		for _, v := range overloads {
			left := v.LeftType.Type()
			right := v.RightType.Type()
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

func GenerateFunctions(from map[string][]parser.Builtin) []byte {
	typePtrs := make(map[uintptr]string)
	typeFns := map[string]interface{}{
		"bool":      parser.TypeBool,
		"bytes":     parser.TypeBytes,
		"date":      parser.TypeDate,
		"float":     parser.TypeFloat,
		"decimal":   parser.TypeDecimal,
		"int":       parser.TypeInt,
		"interval":  parser.TypeInterval,
		"string":    parser.TypeString,
		"timestamp": parser.TypeTimestamp,
	}
	for name, v := range typeFns {
		typePtrs[reflect.ValueOf(v).Pointer()] = name
	}
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
			var args string
			switch ft := fn.Types.(type) {
			case parser.ArgTypes:
				var typs []string
				for _, typ := range ft {
					typs = append(typs, linkType(typ.Type()))
				}
				args = strings.Join(typs, ", ")
			case parser.AnyType:
				args = "T, ..."
			case parser.VariadicType:
				args = fmt.Sprintf("%s, ...", ft.Typ.Type())
			default:
				panic(fmt.Sprintf("unknown type: %T", ft))
			}
			var fp uintptr
			ret := "T"
			if fn.ReturnType != nil {
				fp = reflect.ValueOf(fn.ReturnType).Pointer()
				ret = typePtrs[fp]
			}
			s := fmt.Sprintf("%s(%s) | %s", name, args, linkType(ret))
			functions[ret] = append(functions[ret], s)
		}
	}
	var rets []string
	for k, v := range functions {
		sort.Strings(v)
		rets = append(rets, k)
	}
	sort.Strings(rets)
	b := new(bytes.Buffer)
	for _, ret := range rets {
		fmt.Fprintf(b, "### %s Functions\n\nFunction | Return\n", ret)
		b.WriteString("--- | ---\n")
		b.WriteString(strings.Join(functions[ret], "\n"))
		b.WriteString("\n\n")
	}
	return b.Bytes()
}

func linkType(t string) string {
	switch t {
	case "int", "decimal", "float", "bool", "date", "timestamp", "interval", "string", "bytes":
		return fmt.Sprintf("[%s](%s.html)", t, t)
	}
	return t
}
