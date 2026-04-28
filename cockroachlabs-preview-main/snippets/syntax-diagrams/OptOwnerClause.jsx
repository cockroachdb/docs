export const OptOwnerClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="377" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">OWNER</text><a xlink:href="#opt_equal" xlink:title="opt_equal">
<rect height="32" width="84" x="143" y="23"></rect>
<rect class="nonterminal" height="32" width="84" x="141" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="10" class="nonterminal" x="153" y="41">opt_equal</text></a><a xlink:href="#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="247" y="23"></rect>
<rect class="nonterminal" height="32" width="82" x="245" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="257" y="41">role_spec</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h288 m-318 0 h20 m298 0 h20 m-338 0 q10 0 10 10 m318 0 q0 -10 10 -10 m-328 10 v12 m318 0 v-12 m-318 12 q0 10 10 10 m298 0 q10 0 10 -10 m-308 10 h10 m72 0 h10 m0 0 h10 m84 0 h10 m0 0 h10 m82 0 h10 m23 -32 h-3"></path>
<polygon points="367 5 375 1 375 9"></polygon>
<polygon points="367 5 359 1 359 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
