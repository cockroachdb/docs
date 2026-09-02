export const ToOrEq = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="223" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="61" y="21">a_expr</text></a><a xlink:href="#extra_var_value" xlink:title="extra_var_value">
<rect height="32" width="124" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="124" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="61" y="65">extra_var_value</text></a><path class="line" d="m17 17 h2 m20 0 h10 m64 0 h10 m0 0 h60 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v24 m164 0 v-24 m-164 24 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m124 0 h10 m23 -44 h-3"></path>
<polygon points="213 17 221 13 221 21"></polygon>
<polygon points="213 17 205 13 205 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
