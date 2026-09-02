export const FuncExpr = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="625" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
text {
  fill: #2f3337;
  font-size: 14px;
}
rect {
  fill: #ffffff;
  stroke: #3a3d40;
  stroke-width: 2;
}
rect.terminal {
  fill: #ffffff;
}
rect.nonterminal {
  fill: #ffffff;
}
text.terminal {
  fill: #2f3337;
  font-weight: 600;
}
text.nonterminal {
  fill: #2563eb;
}
a text.nonterminal {
  text-decoration: underline;
}
path.line {
  fill: none;
  stroke: #3a3d40;
  stroke-width: 2;
}
polygon {
  fill: #2f3337;
  stroke: #2f3337;
}</style>
<polygon points="9 17 1 13 1 21"></polygon>
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#func_application" xlink:title="func_application">
<rect height="32" width="124" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="61" y="21">func_application</text></a><a xlink:href="#within_group_clause" xlink:title="within_group_clause">
<rect height="32" width="150" x="195" y="3"></rect>
<rect class="nonterminal" height="32" width="150" x="193" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="126" font-size="10" class="nonterminal" x="205" y="21">within_group_clause</text></a><a xlink:href="#filter_clause" xlink:title="filter_clause">
<rect height="32" width="96" x="365" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="363" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="375" y="21">filter_clause</text></a><a xlink:href="#over_clause" xlink:title="over_clause">
<rect height="32" width="96" x="481" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="479" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="491" y="21">over_clause</text></a><a xlink:href="#func_expr_common_subexpr" xlink:title="func_expr_common_subexpr">
<rect height="32" width="202" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="202" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="178" font-size="11" class="nonterminal" x="61" y="65">func_expr_common_subexpr</text></a><path class="line" d="m17 17 h2 m20 0 h10 m124 0 h10 m0 0 h10 m150 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m96 0 h10 m-566 0 h20 m546 0 h20 m-586 0 q10 0 10 10 m566 0 q0 -10 10 -10 m-576 10 v24 m566 0 v-24 m-566 24 q0 10 10 10 m546 0 q10 0 10 -10 m-556 10 h10 m202 0 h10 m0 0 h324 m23 -44 h-3"></path>
<polygon points="615 17 623 13 623 21"></polygon>
<polygon points="615 17 607 13 607 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
