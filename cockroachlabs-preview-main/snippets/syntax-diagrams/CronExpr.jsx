export const CronExpr = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="343" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="100" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">RECURRING</text><a xlink:href="#sconst_or_placeholder" xlink:title="sconst_or_placeholder">
<rect height="32" width="164" x="151" y="3"></rect>
<rect class="nonterminal" height="32" width="164" x="149" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="140" font-size="10" class="nonterminal" x="161" y="21">sconst_or_placeholder</text></a><path class="line" d="m17 17 h2 m0 0 h10 m100 0 h10 m0 0 h10 m164 0 h10 m3 0 h-3"></path>
<polygon points="333 17 341 13 341 21"></polygon>
<polygon points="333 17 325 13 325 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
