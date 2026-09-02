export const Stmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="145" width="331" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 5 1 1 1 9"></polygon>
<polygon points="17 5 9 1 9 9"></polygon>
<rect height="32" rx="10" width="102" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">HELPTOKEN</text><a xlink:href="#stmt_without_legacy_transaction" xlink:title="stmt_without_legacy_transaction">
<rect height="32" width="232" x="51" y="67"></rect>
<rect class="nonterminal" height="32" width="232" x="49" y="65"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="208" font-size="10" class="nonterminal" x="61" y="85">stmt_without_legacy_transaction</text></a><a xlink:href="#legacy_transaction_stmt" xlink:title="legacy_transaction_stmt">
<rect height="32" width="176" x="51" y="111"></rect>
<rect class="nonterminal" height="32" width="176" x="49" y="109"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="152" font-size="10" class="nonterminal" x="61" y="129">legacy_transaction_stmt</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h242 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v12 m272 0 v-12 m-272 12 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m102 0 h10 m0 0 h130 m-262 -10 v20 m272 0 v-20 m-272 20 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m232 0 h10 m-262 -10 v20 m272 0 v-20 m-272 20 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m176 0 h10 m0 0 h56 m23 -120 h-3"></path>
<polygon points="321 5 329 1 329 9"></polygon>
<polygon points="321 5 313 1 313 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
