export const ShowTransactionsStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="487" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SHOW</text>
<rect height="32" rx="10" width="44" x="135" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="133" y="33"></rect>
<text class="terminal" x="143" y="53">ALL</text><a xlink:href="#opt_cluster" xlink:title="opt_cluster">
<rect height="32" width="92" x="219" y="3"></rect>
<rect class="nonterminal" height="32" width="92" x="217" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="229" y="21">opt_cluster</text></a><rect height="32" rx="10" width="128" x="331" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="329" y="1"></rect>
<text class="terminal" x="339" y="21">TRANSACTIONS</text>
<path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m20 0 h10 m0 0 h54 m-84 0 h20 m64 0 h20 m-104 0 q10 0 10 10 m84 0 q0 -10 10 -10 m-94 10 v12 m84 0 v-12 m-84 12 q0 10 10 10 m64 0 q10 0 10 -10 m-74 10 h10 m44 0 h10 m20 -32 h10 m92 0 h10 m0 0 h10 m128 0 h10 m3 0 h-3"></path>
<polygon points="477 17 485 13 485 21"></polygon>
<polygon points="477 17 469 13 469 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
