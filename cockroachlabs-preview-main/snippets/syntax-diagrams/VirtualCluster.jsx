export const VirtualCluster = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="255" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#d_expr" xlink:title="d_expr">
<rect height="32" width="64" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="61" y="21">d_expr</text></a><rect height="32" rx="10" width="26" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">[</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="97" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="95" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="107" y="65">a_expr</text></a><rect height="32" rx="10" width="26" x="181" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="179" y="45"></rect>
<text class="terminal" x="189" y="65">]</text>
<path class="line" d="m17 17 h2 m20 0 h10 m64 0 h10 m0 0 h92 m-196 0 h20 m176 0 h20 m-216 0 q10 0 10 10 m196 0 q0 -10 10 -10 m-206 10 v24 m196 0 v-24 m-196 24 q0 10 10 10 m176 0 q10 0 10 -10 m-186 10 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m23 -44 h-3"></path>
<polygon points="245 17 253 13 253 21"></polygon>
<polygon points="245 17 237 13 237 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
