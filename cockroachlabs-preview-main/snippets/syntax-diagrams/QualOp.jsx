export const QualOp = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="365" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="96" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="96" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">OPERATOR</text>
<rect height="32" rx="10" width="26" x="147" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="145" y="1"></rect>
<text class="terminal" x="155" y="21">(</text><a xlink:href="#operator_op" xlink:title="operator_op">
<rect height="32" width="98" x="193" y="3"></rect>
<rect class="nonterminal" height="32" width="98" x="191" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="203" y="21">operator_op</text></a><rect height="32" rx="10" width="26" x="311" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="309" y="1"></rect>
<text class="terminal" x="319" y="21">)</text>
<path class="line" d="m17 17 h2 m0 0 h10 m96 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m98 0 h10 m0 0 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="355 17 363 13 363 21"></polygon>
<polygon points="355 17 347 13 347 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
