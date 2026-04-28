export const ResetVars = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="113" width="419" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">RESET</text>
<rect height="32" rx="10" width="82" x="153" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="151" y="33"></rect>
<text class="terminal" x="161" y="53">SESSION</text><a xlink:href="/docs/stable/sql-grammar#session_var" xlink:title="session_var">
<rect height="32" width="96" x="275" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="273" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="285" y="21">session_var</text></a><rect height="32" rx="10" width="96" x="51" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="96" x="49" y="77"></rect>
<text class="terminal" x="59" y="97">RESET_ALL</text>
<rect height="32" rx="10" width="44" x="167" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="165" y="77"></rect>
<text class="terminal" x="175" y="97">ALL</text>
<path class="line" d="m17 17 h2 m20 0 h10 m62 0 h10 m20 0 h10 m0 0 h92 m-122 0 h20 m102 0 h20 m-142 0 q10 0 10 10 m122 0 q0 -10 10 -10 m-132 10 v12 m122 0 v-12 m-122 12 q0 10 10 10 m102 0 q10 0 10 -10 m-112 10 h10 m82 0 h10 m20 -32 h10 m96 0 h10 m-360 0 h20 m340 0 h20 m-380 0 q10 0 10 10 m360 0 q0 -10 10 -10 m-370 10 v56 m360 0 v-56 m-360 56 q0 10 10 10 m340 0 q10 0 10 -10 m-350 10 h10 m96 0 h10 m0 0 h10 m44 0 h10 m0 0 h160 m23 -76 h-3"></path>
<polygon points="409 17 417 13 417 21"></polygon>
<polygon points="409 17 401 13 401 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
