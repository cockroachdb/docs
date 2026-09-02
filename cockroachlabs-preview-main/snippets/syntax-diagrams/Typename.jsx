export const Typename = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="387" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#simple_typename" xlink:title="simple_typename">
<rect height="32" width="132" x="31" y="3"></rect>
<rect class="nonterminal" height="32" width="132" x="29" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="108" font-size="11" class="nonterminal" x="41" y="21">simple_typename</text></a><a xlink:href="#opt_array_bounds" xlink:title="opt_array_bounds">
<rect height="32" width="136" x="203" y="3"></rect>
<rect class="nonterminal" height="32" width="136" x="201" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="213" y="21">opt_array_bounds</text></a><rect height="32" rx="10" width="66" x="203" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="201" y="45"></rect>
<text class="terminal" x="211" y="65">ARRAY</text>
<path class="line" d="m17 17 h2 m0 0 h10 m132 0 h10 m20 0 h10 m136 0 h10 m-176 0 h20 m156 0 h20 m-196 0 q10 0 10 10 m176 0 q0 -10 10 -10 m-186 10 v24 m176 0 v-24 m-176 24 q0 10 10 10 m156 0 q10 0 10 -10 m-166 10 h10 m66 0 h10 m0 0 h70 m23 -44 h-3"></path>
<polygon points="377 17 385 13 385 21"></polygon>
<polygon points="377 17 369 13 369 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
