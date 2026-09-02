export const LimitClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="157" width="715" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="60" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">LIMIT</text>
<rect height="32" rx="10" width="44" x="151" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="149" y="1"></rect>
<text class="terminal" x="159" y="21">ALL</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="151" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="149" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="161" y="65">a_expr</text></a><rect height="32" rx="10" width="62" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">FETCH</text><a xlink:href="#first_or_next" xlink:title="first_or_next">
<rect height="32" width="102" x="133" y="91"></rect>
<rect class="nonterminal" height="32" width="102" x="131" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="143" y="109">first_or_next</text></a><a xlink:href="#select_fetch_first_value" xlink:title="select_fetch_first_value">
<rect height="32" width="172" x="275" y="123"></rect>
<rect class="nonterminal" height="32" width="172" x="273" y="121"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="148" font-size="10" class="nonterminal" x="285" y="141">select_fetch_first_value</text></a><a xlink:href="#row_or_rows" xlink:title="row_or_rows">
<rect height="32" width="102" x="487" y="91"></rect>
<rect class="nonterminal" height="32" width="102" x="485" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="11" class="nonterminal" x="497" y="109">row_or_rows</text></a><rect height="32" rx="10" width="58" x="609" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="607" y="89"></rect>
<text class="terminal" x="617" y="109">ONLY</text>
<path class="line" d="m17 17 h2 m20 0 h10 m60 0 h10 m20 0 h10 m44 0 h10 m0 0 h20 m-104 0 h20 m84 0 h20 m-124 0 q10 0 10 10 m104 0 q0 -10 10 -10 m-114 10 v24 m104 0 v-24 m-104 24 q0 10 10 10 m84 0 q10 0 10 -10 m-94 10 h10 m64 0 h10 m20 -44 h432 m-656 0 h20 m636 0 h20 m-676 0 q10 0 10 10 m656 0 q0 -10 10 -10 m-666 10 v68 m656 0 v-68 m-656 68 q0 10 10 10 m636 0 q10 0 10 -10 m-646 10 h10 m62 0 h10 m0 0 h10 m102 0 h10 m20 0 h10 m0 0 h182 m-212 0 h20 m192 0 h20 m-232 0 q10 0 10 10 m212 0 q0 -10 10 -10 m-222 10 v12 m212 0 v-12 m-212 12 q0 10 10 10 m192 0 q10 0 10 -10 m-202 10 h10 m172 0 h10 m20 -32 h10 m102 0 h10 m0 0 h10 m58 0 h10 m23 -88 h-3"></path>
<polygon points="705 17 713 13 713 21"></polygon>
<polygon points="705 17 697 13 697 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
