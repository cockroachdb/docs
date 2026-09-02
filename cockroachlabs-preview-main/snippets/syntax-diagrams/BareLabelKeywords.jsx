export const BareLabelKeywords = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="349" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="26" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">(</text><a xlink:href="#col_def_list_no_types" xlink:title="col_def_list_no_types">
<rect height="32" width="158" x="97" y="23"></rect>
<rect class="nonterminal" height="32" width="158" x="95" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="107" y="41">col_def_list_no_types</text></a><rect height="32" rx="10" width="26" x="275" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="273" y="21"></rect>
<text class="terminal" x="283" y="41">)</text>
<path class="line" d="m17 5 h2 m20 0 h10 m0 0 h260 m-290 0 h20 m270 0 h20 m-310 0 q10 0 10 10 m290 0 q0 -10 10 -10 m-300 10 v12 m290 0 v-12 m-290 12 q0 10 10 10 m270 0 q10 0 10 -10 m-280 10 h10 m26 0 h10 m0 0 h10 m158 0 h10 m0 0 h10 m26 0 h10 m23 -32 h-3"></path>
<polygon points="339 5 347 1 347 9"></polygon>
<polygon points="339 5 331 1 331 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
