export const CreateSequenceStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="135" width="735" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">CREATE</text><a xlink:href="#opt_temp" xlink:title="opt_temp">
<rect height="32" width="82" x="123" y="3"></rect>
<rect class="nonterminal" height="32" width="82" x="121" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="11" class="nonterminal" x="133" y="21">opt_temp</text></a><rect height="32" rx="10" width="92" x="225" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="223" y="1"></rect>
<text class="terminal" x="233" y="21">SEQUENCE</text>
<rect height="32" rx="10" width="34" x="357" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="355" y="33"></rect>
<text class="terminal" x="365" y="53">IF</text>
<rect height="32" rx="10" width="48" x="411" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="409" y="33"></rect>
<text class="terminal" x="419" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="479" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="477" y="33"></rect>
<text class="terminal" x="487" y="53">EXISTS</text><a xlink:href="#sequence_name" xlink:title="sequence_name">
<rect height="32" width="124" x="589" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="587" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="599" y="21">sequence_name</text></a><a xlink:href="#opt_sequence_option_list" xlink:title="opt_sequence_option_list">
<rect height="32" width="184" x="523" y="101"></rect>
<rect class="nonterminal" height="32" width="184" x="521" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="160" font-size="10" class="nonterminal" x="533" y="119">opt_sequence_option_list</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m92 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m124 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-234 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m184 0 h10 m3 0 h-3"></path>
<polygon points="725 115 733 111 733 119"></polygon>
<polygon points="725 115 717 111 717 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
