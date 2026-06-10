export const ExplainStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="113" width="723" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">EXPLAIN</text>
<rect height="32" rx="10" width="82" x="151" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="149" y="33"></rect>
<text class="terminal" x="159" y="53">ANALYZE</text>
<rect height="32" rx="10" width="82" x="151" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="149" y="77"></rect>
<text class="terminal" x="159" y="97">ANALYSE</text>
<rect height="32" rx="10" width="26" x="293" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="291" y="33"></rect>
<text class="terminal" x="301" y="53">(</text><a xlink:href="#explain_option_list" xlink:title="explain_option_list">
<rect height="32" width="140" x="339" y="35"></rect>
<rect class="nonterminal" height="32" width="140" x="337" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="10" class="nonterminal" x="349" y="53">explain_option_list</text></a><rect height="32" rx="10" width="26" x="499" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="497" y="33"></rect>
<text class="terminal" x="507" y="53">)</text><a xlink:href="#explainable_stmt" xlink:title="explainable_stmt">
<rect height="32" width="130" x="565" y="3"></rect>
<rect class="nonterminal" height="32" width="130" x="563" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="575" y="21">explainable_stmt</text></a><path class="line" d="m17 17 h2 m0 0 h10 m80 0 h10 m20 0 h10 m0 0 h92 m-122 0 h20 m102 0 h20 m-142 0 q10 0 10 10 m122 0 q0 -10 10 -10 m-132 10 v12 m122 0 v-12 m-122 12 q0 10 10 10 m102 0 q10 0 10 -10 m-112 10 h10 m82 0 h10 m-112 -10 v20 m122 0 v-20 m-122 20 v24 m122 0 v-24 m-122 24 q0 10 10 10 m102 0 q10 0 10 -10 m-112 10 h10 m82 0 h10 m40 -76 h10 m0 0 h242 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v12 m272 0 v-12 m-272 12 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m26 0 h10 m0 0 h10 m140 0 h10 m0 0 h10 m26 0 h10 m20 -32 h10 m130 0 h10 m3 0 h-3"></path>
<polygon points="713 17 721 13 721 21"></polygon>
<polygon points="713 17 705 13 705 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
