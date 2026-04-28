export const SetOrResetClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="125" width="277" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="44" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">SET</text><a xlink:href="#set_rest" xlink:title="set_rest">
<rect height="32" width="72" x="115" y="3"></rect>
<rect class="nonterminal" height="32" width="72" x="113" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="48" font-size="10" class="nonterminal" x="125" y="21">set_rest</text></a><rect height="32" rx="10" width="96" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="96" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">RESET_ALL</text>
<rect height="32" rx="10" width="44" x="167" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="165" y="45"></rect>
<text class="terminal" x="175" y="65">ALL</text>
<rect height="32" rx="10" width="62" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">RESET</text><a xlink:href="#session_var" xlink:title="session_var">
<rect height="32" width="96" x="133" y="91"></rect>
<rect class="nonterminal" height="32" width="96" x="131" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="143" y="109">session_var</text></a><path class="line" d="m17 17 h2 m20 0 h10 m44 0 h10 m0 0 h10 m72 0 h10 m0 0 h42 m-218 0 h20 m198 0 h20 m-238 0 q10 0 10 10 m218 0 q0 -10 10 -10 m-228 10 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m96 0 h10 m0 0 h10 m44 0 h10 m0 0 h18 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m62 0 h10 m0 0 h10 m96 0 h10 m23 -88 h-3"></path>
<polygon points="267 17 275 13 275 21"></polygon>
<polygon points="267 17 259 13 259 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
