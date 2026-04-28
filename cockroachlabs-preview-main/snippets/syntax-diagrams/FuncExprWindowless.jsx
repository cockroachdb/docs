export const FuncExprWindowless = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="301" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="61" y="21">func_application</text></a><a xlink:href="#func_expr_common_subexpr" xlink:title="func_expr_common_subexpr">
<rect height="32" width="202" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="202" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="178" font-size="11" class="nonterminal" x="61" y="65">func_expr_common_subexpr</text></a><path class="line" d="m17 17 h2 m20 0 h10 m124 0 h10 m0 0 h78 m-242 0 h20 m222 0 h20 m-262 0 q10 0 10 10 m242 0 q0 -10 10 -10 m-252 10 v24 m242 0 v-24 m-242 24 q0 10 10 10 m222 0 q10 0 10 -10 m-232 10 h10 m202 0 h10 m23 -44 h-3"></path>
<polygon points="291 17 299 13 299 21"></polygon>
<polygon points="291 17 283 13 283 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
