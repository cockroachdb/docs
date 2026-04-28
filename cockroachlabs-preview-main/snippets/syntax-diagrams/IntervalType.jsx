export const IntervalType = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="113" width="373" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="88" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">INTERVAL</text><a xlink:href="#interval_qualifier" xlink:title="interval_qualifier">
<rect height="32" width="126" x="159" y="35"></rect>
<rect class="nonterminal" height="32" width="126" x="157" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="169" y="53">interval_qualifier</text></a><rect height="32" rx="10" width="26" x="159" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="157" y="77"></rect>
<text class="terminal" x="167" y="97">(</text>
<rect height="32" rx="10" width="74" x="205" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="203" y="77"></rect>
<text class="terminal" x="213" y="97">ICONST</text>
<rect height="32" rx="10" width="26" x="299" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="297" y="77"></rect>
<text class="terminal" x="307" y="97">)</text>
<path class="line" d="m17 17 h2 m0 0 h10 m88 0 h10 m20 0 h10 m0 0 h176 m-206 0 h20 m186 0 h20 m-226 0 q10 0 10 10 m206 0 q0 -10 10 -10 m-216 10 v12 m206 0 v-12 m-206 12 q0 10 10 10 m186 0 q10 0 10 -10 m-196 10 h10 m126 0 h10 m0 0 h40 m-196 -10 v20 m206 0 v-20 m-206 20 v24 m206 0 v-24 m-206 24 q0 10 10 10 m186 0 q10 0 10 -10 m-196 10 h10 m26 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m26 0 h10 m23 -76 h-3"></path>
<polygon points="363 17 371 13 371 21"></polygon>
<polygon points="363 17 355 13 355 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
