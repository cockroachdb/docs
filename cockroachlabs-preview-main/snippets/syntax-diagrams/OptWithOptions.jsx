export const OptWithOptions = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="101" width="521" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">WITH</text><a xlink:href="#kv_option_list" xlink:title="kv_option_list">
<rect height="32" width="108" x="149" y="23"></rect>
<rect class="nonterminal" height="32" width="108" x="147" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="159" y="41">kv_option_list</text></a><rect height="32" rx="10" width="84" x="149" y="67"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="147" y="65"></rect>
<text class="terminal" x="157" y="85">OPTIONS</text>
<rect height="32" rx="10" width="26" x="253" y="67"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="251" y="65"></rect>
<text class="terminal" x="261" y="85">(</text><a xlink:href="#kv_option_list" xlink:title="kv_option_list">
<rect height="32" width="108" x="299" y="67"></rect>
<rect class="nonterminal" height="32" width="108" x="297" y="65"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="309" y="85">kv_option_list</text></a><rect height="32" rx="10" width="26" x="427" y="67"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="425" y="65"></rect>
<text class="terminal" x="435" y="85">)</text>
<path class="line" d="m17 5 h2 m20 0 h10 m0 0 h432 m-462 0 h20 m442 0 h20 m-482 0 q10 0 10 10 m462 0 q0 -10 10 -10 m-472 10 v12 m462 0 v-12 m-462 12 q0 10 10 10 m442 0 q10 0 10 -10 m-452 10 h10 m58 0 h10 m20 0 h10 m108 0 h10 m0 0 h196 m-344 0 h20 m324 0 h20 m-364 0 q10 0 10 10 m344 0 q0 -10 10 -10 m-354 10 v24 m344 0 v-24 m-344 24 q0 10 10 10 m324 0 q10 0 10 -10 m-334 10 h10 m84 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m108 0 h10 m0 0 h10 m26 0 h10 m43 -76 h-3"></path>
<polygon points="511 5 519 1 519 9"></polygon>
<polygon points="511 5 503 1 503 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
