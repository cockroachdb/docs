export const SurvivalGoalClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="475" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="80" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SURVIVE</text><a xlink:href="#opt_equal" xlink:title="opt_equal">
<rect height="32" width="84" x="131" y="3"></rect>
<rect class="nonterminal" height="32" width="84" x="129" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="10" class="nonterminal" x="141" y="21">opt_equal</text></a><rect height="32" rx="10" width="74" x="255" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="253" y="1"></rect>
<text class="terminal" x="263" y="21">REGION</text>
<rect height="32" rx="10" width="58" x="255" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="253" y="45"></rect>
<text class="terminal" x="263" y="65">ZONE</text>
<rect height="32" rx="10" width="78" x="369" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="367" y="1"></rect>
<text class="terminal" x="377" y="21">FAILURE</text>
<path class="line" d="m17 17 h2 m0 0 h10 m80 0 h10 m0 0 h10 m84 0 h10 m20 0 h10 m74 0 h10 m-114 0 h20 m94 0 h20 m-134 0 q10 0 10 10 m114 0 q0 -10 10 -10 m-124 10 v24 m114 0 v-24 m-114 24 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m58 0 h10 m0 0 h16 m20 -44 h10 m78 0 h10 m3 0 h-3"></path>
<polygon points="465 17 473 13 473 21"></polygon>
<polygon points="465 17 457 13 457 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
