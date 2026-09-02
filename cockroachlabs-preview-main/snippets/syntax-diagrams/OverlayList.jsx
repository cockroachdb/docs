export const OverlayList = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="113" width="561" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="61" y="21">a_expr</text></a><a xlink:href="#overlay_placing" xlink:title="overlay_placing">
<rect height="32" width="118" x="135" y="3"></rect>
<rect class="nonterminal" height="32" width="118" x="133" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="94" font-size="10" class="nonterminal" x="145" y="21">overlay_placing</text></a><a xlink:href="#substr_from" xlink:title="substr_from">
<rect height="32" width="96" x="273" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="271" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="283" y="21">substr_from</text></a><a xlink:href="#substr_for" xlink:title="substr_for">
<rect height="32" width="84" x="409" y="35"></rect>
<rect class="nonterminal" height="32" width="84" x="407" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="10" class="nonterminal" x="419" y="53">substr_for</text></a><a xlink:href="#expr_list" xlink:title="expr_list">
<rect height="32" width="74" x="51" y="79"></rect>
<rect class="nonterminal" height="32" width="74" x="49" y="77"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="50" font-size="10" class="nonterminal" x="61" y="97">expr_list</text></a><path class="line" d="m17 17 h2 m20 0 h10 m64 0 h10 m0 0 h10 m118 0 h10 m0 0 h10 m96 0 h10 m20 0 h10 m0 0 h94 m-124 0 h20 m104 0 h20 m-144 0 q10 0 10 10 m124 0 q0 -10 10 -10 m-134 10 v12 m124 0 v-12 m-124 12 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m84 0 h10 m-482 -32 h20 m482 0 h20 m-522 0 q10 0 10 10 m502 0 q0 -10 10 -10 m-512 10 v56 m502 0 v-56 m-502 56 q0 10 10 10 m482 0 q10 0 10 -10 m-492 10 h10 m74 0 h10 m0 0 h388 m23 -76 h-3"></path>
<polygon points="551 17 559 13 559 21"></polygon>
<polygon points="551 17 543 13 543 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
