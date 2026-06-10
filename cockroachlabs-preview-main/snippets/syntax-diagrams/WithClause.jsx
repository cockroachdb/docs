export const WithClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="361" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">WITH</text>
<rect height="32" rx="10" width="98" x="129" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="127" y="33"></rect>
<text class="terminal" x="137" y="53">RECURSIVE</text><a xlink:href="#cte_list" xlink:title="cte_list">
<rect height="32" width="66" x="267" y="3"></rect>
<rect class="nonterminal" height="32" width="66" x="265" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="42" font-size="10" class="nonterminal" x="277" y="21">cte_list</text></a><path class="line" d="m17 17 h2 m0 0 h10 m58 0 h10 m20 0 h10 m0 0 h108 m-138 0 h20 m118 0 h20 m-158 0 q10 0 10 10 m138 0 q0 -10 10 -10 m-148 10 v12 m138 0 v-12 m-138 12 q0 10 10 10 m118 0 q10 0 10 -10 m-128 10 h10 m98 0 h10 m20 -32 h10 m66 0 h10 m3 0 h-3"></path>
<polygon points="351 17 359 13 359 21"></polygon>
<polygon points="351 17 343 13 343 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
