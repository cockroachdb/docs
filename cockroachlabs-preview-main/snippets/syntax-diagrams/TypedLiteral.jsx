export const TypedLiteral = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="385" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#func_name_no_crdb_extra" xlink:title="func_name_no_crdb_extra">
<rect height="32" width="190" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="190" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="166" font-size="11" class="nonterminal" x="61" y="21">func_name_no_crdb_extra</text></a><a xlink:href="#const_typename" xlink:title="const_typename">
<rect height="32" width="126" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="126" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="11" class="nonterminal" x="61" y="65">const_typename</text></a><rect height="32" rx="10" width="76" x="281" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="279" y="1"></rect>
<text class="terminal" x="289" y="21">SCONST</text>
<path class="line" d="m17 17 h2 m20 0 h10 m190 0 h10 m-230 0 h20 m210 0 h20 m-250 0 q10 0 10 10 m230 0 q0 -10 10 -10 m-240 10 v24 m230 0 v-24 m-230 24 q0 10 10 10 m210 0 q10 0 10 -10 m-220 10 h10 m126 0 h10 m0 0 h64 m20 -44 h10 m76 0 h10 m3 0 h-3"></path>
<polygon points="375 17 383 13 383 21"></polygon>
<polygon points="375 17 367 13 367 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
