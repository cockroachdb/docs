package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/cockroachdb/cockroach/pkg/sql/parser"
	"github.com/cockroachdb/cockroach/pkg/sql/sem/tree"

	// Initialize the builtins.
	_ "github.com/cockroachdb/cockroach/pkg/sql/sem/builtins"
)

func main() {
	sqlRE := regexp.MustCompile(`(?is)~~~ ?sql(\s+)(.*?)(\s*~~~)`)
	exprRE := regexp.MustCompile(`^(?s)(\s*)(.*?)(\s*)$`)
	splitRE := regexp.MustCompile(`(?m)^>`)
	cfg := tree.DefaultPrettyCfg()
	cfg.LineWidth = 80
	cfg.UseTabs = false
	cfg.TabWidth = 2

	err := filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() || ignorePath(path) {
			return nil
		}
		b, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}
		n := sqlRE.ReplaceAllFunc(b, func(found []byte) []byte {
			// Never format anything with comments.
			if bytes.Contains(found, []byte("--")) {
				fmt.Printf("block in %s: contains comments, skipping\n", path)
				return found
			}

			blockMatch := sqlRE.FindSubmatch(found)
			var buf bytes.Buffer
			buf.WriteString("~~~ sql")
			buf.Write(blockMatch[1])
			exprs := splitRE.Split(string(blockMatch[2]), -1)
			for i, expr := range exprs {
				expr := []byte(expr)
				if i > 0 {
					buf.WriteByte('>')
				}

				exprMatch := exprRE.FindSubmatch(expr)
				s, err := parser.ParseOne(string(exprMatch[2]))
				if err != nil {
					buf.Write(expr)
					continue
				}
				buf.Write(exprMatch[1])
				buf.WriteString(cfg.Pretty(s))
				buf.WriteByte(';')
				buf.Write(exprMatch[3])
			}
			buf.Write(blockMatch[3])
			return buf.Bytes()
		})
		if bytes.Equal(b, n) {
			return nil
		}
		return ioutil.WriteFile(path, n, 0666)
	})
	if err != nil {
		fmt.Println(err)
	}
}

func ignorePath(path string) bool {
	if !strings.HasSuffix(path, ".md") {
		return true
	}
	if strings.Contains(path, "v2.1/") {
		return false
	}
	// Allow processing of files in the root directory.
	if !strings.Contains(path, "/") {
		return false
	}
	return true
}
