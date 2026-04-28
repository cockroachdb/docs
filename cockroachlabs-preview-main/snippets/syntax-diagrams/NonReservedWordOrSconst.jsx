export const NonReservedWordOrSconst = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="245" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#non_reserved_word" xlink:title="non_reserved_word">
<rect height="32" width="146" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="146" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="122" font-size="11" class="nonterminal" x="61" y="21">non_reserved_word</text></a><rect height="32" rx="10" width="76" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">SCONST</text>
<path class="line" d="m17 17 h2 m20 0 h10 m146 0 h10 m-186 0 h20 m166 0 h20 m-206 0 q10 0 10 10 m186 0 q0 -10 10 -10 m-196 10 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m76 0 h10 m0 0 h70 m23 -44 h-3"></path>
<polygon points="235 17 243 13 243 21"></polygon>
<polygon points="235 17 227 13 227 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
