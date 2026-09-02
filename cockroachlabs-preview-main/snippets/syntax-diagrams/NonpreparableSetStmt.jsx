export const NonpreparableSetStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="215" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#set_transaction_stmt" xlink:title="set_transaction_stmt">
<rect height="32" width="156" x="31" y="3"></rect>
<rect class="nonterminal" height="32" width="156" x="29" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="10" class="nonterminal" x="41" y="21">set_transaction_stmt</text></a><path class="line" d="m17 17 h2 m0 0 h10 m156 0 h10 m3 0 h-3"></path>
<polygon points="205 17 213 13 213 21"></polygon>
<polygon points="205 17 197 13 197 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
