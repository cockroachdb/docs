export const ArrayExpr = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="307" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon>
<rect height="32" rx="10" width="26" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">[</text><a xlink:href="#opt_expr_list" xlink:title="opt_expr_list">
<rect height="32" width="104" x="97" y="3"></rect>
<rect class="nonterminal" height="32" width="104" x="95" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="10" class="nonterminal" x="107" y="21">opt_expr_list</text></a><a xlink:href="#array_expr_list" xlink:title="array_expr_list">
<rect height="32" width="116" x="97" y="47"></rect>
<rect class="nonterminal" height="32" width="116" x="95" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="92" font-size="10" class="nonterminal" x="107" y="65">array_expr_list</text></a><rect height="32" rx="10" width="26" x="253" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="251" y="1"></rect>
<text class="terminal" x="261" y="21">]</text>
<path class="line" d="m17 17 h2 m0 0 h10 m26 0 h10 m20 0 h10 m104 0 h10 m0 0 h12 m-156 0 h20 m136 0 h20 m-176 0 q10 0 10 10 m156 0 q0 -10 10 -10 m-166 10 v24 m156 0 v-24 m-156 24 q0 10 10 10 m136 0 q10 0 10 -10 m-146 10 h10 m116 0 h10 m20 -44 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="297 17 305 13 305 21"></polygon>
<polygon points="297 17 289 13 289 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
