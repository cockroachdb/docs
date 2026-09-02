export const OverClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="101" width="369" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">OVER</text><a xlink:href="#window_specification" xlink:title="window_specification">
<rect height="32" width="152" x="149" y="23"></rect>
<rect class="nonterminal" height="32" width="152" x="147" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="128" font-size="10" class="nonterminal" x="159" y="41">window_specification</text></a><a xlink:href="#window_name" xlink:title="window_name">
<rect height="32" width="110" x="149" y="67"></rect>
<rect class="nonterminal" height="32" width="110" x="147" y="65"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="12" class="nonterminal" x="159" y="85">window_name</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h280 m-310 0 h20 m290 0 h20 m-330 0 q10 0 10 10 m310 0 q0 -10 10 -10 m-320 10 v12 m310 0 v-12 m-310 12 q0 10 10 10 m290 0 q10 0 10 -10 m-300 10 h10 m58 0 h10 m20 0 h10 m152 0 h10 m-192 0 h20 m172 0 h20 m-212 0 q10 0 10 10 m192 0 q0 -10 10 -10 m-202 10 v24 m192 0 v-24 m-192 24 q0 10 10 10 m172 0 q10 0 10 -10 m-182 10 h10 m110 0 h10 m0 0 h42 m43 -76 h-3"></path>
<polygon points="359 5 367 1 367 9"></polygon>
<polygon points="359 5 351 1 351 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
