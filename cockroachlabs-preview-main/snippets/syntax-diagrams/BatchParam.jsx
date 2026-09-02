export const BatchParam = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="195" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="52" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="52" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SIZE</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="103" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="101" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="113" y="21">a_expr</text></a><path class="line" d="m17 17 h2 m0 0 h10 m52 0 h10 m0 0 h10 m64 0 h10 m3 0 h-3"></path>
<polygon points="185 17 193 13 193 21"></polygon>
<polygon points="185 17 177 13 177 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
