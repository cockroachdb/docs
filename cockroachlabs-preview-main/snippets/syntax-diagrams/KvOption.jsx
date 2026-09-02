export const KvOption = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="443" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="56" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="61" y="21">name</text></a><rect height="32" rx="10" width="76" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">SCONST</text>
<rect height="32" rx="10" width="30" x="187" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="185" y="33"></rect>
<text class="terminal" x="195" y="53">=</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="237" y="35"></rect>
<rect class="nonterminal" height="32" width="158" x="235" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="247" y="53">string_or_placeholder</text></a><path class="line" d="m17 17 h2 m20 0 h10 m56 0 h10 m0 0 h20 m-116 0 h20 m96 0 h20 m-136 0 q10 0 10 10 m116 0 q0 -10 10 -10 m-126 10 v24 m116 0 v-24 m-116 24 q0 10 10 10 m96 0 q10 0 10 -10 m-106 10 h10 m76 0 h10 m40 -44 h10 m0 0 h218 m-248 0 h20 m228 0 h20 m-268 0 q10 0 10 10 m248 0 q0 -10 10 -10 m-258 10 v12 m248 0 v-12 m-248 12 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m30 0 h10 m0 0 h10 m158 0 h10 m23 -32 h-3"></path>
<polygon points="433 17 441 13 441 21"></polygon>
<polygon points="433 17 425 13 425 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
