export const OptBatchClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="89" width="447" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 5 1 1 1 9"></polygon>
<polygon points="17 5 9 1 9 9"></polygon>
<rect height="32" rx="10" width="66" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">BATCH</text>
<rect height="32" rx="10" width="26" x="157" y="55"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="155" y="53"></rect>
<text class="terminal" x="165" y="73">(</text><a xlink:href="#batch_param_list" xlink:title="batch_param_list">
<rect height="32" width="130" x="203" y="55"></rect>
<rect class="nonterminal" height="32" width="130" x="201" y="53"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="213" y="73">batch_param_list</text></a><rect height="32" rx="10" width="26" x="353" y="55"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="351" y="53"></rect>
<text class="terminal" x="361" y="73">)</text>
<path class="line" d="m17 5 h2 m20 0 h10 m0 0 h358 m-388 0 h20 m368 0 h20 m-408 0 q10 0 10 10 m388 0 q0 -10 10 -10 m-398 10 v12 m388 0 v-12 m-388 12 q0 10 10 10 m368 0 q10 0 10 -10 m-378 10 h10 m66 0 h10 m20 0 h10 m0 0 h232 m-262 0 h20 m242 0 h20 m-282 0 q10 0 10 10 m262 0 q0 -10 10 -10 m-272 10 v12 m262 0 v-12 m-262 12 q0 10 10 10 m242 0 q10 0 10 -10 m-252 10 h10 m26 0 h10 m0 0 h10 m130 0 h10 m0 0 h10 m26 0 h10 m43 -64 h-3"></path>
<polygon points="437 5 445 1 445 9"></polygon>
<polygon points="437 5 429 1 429 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
