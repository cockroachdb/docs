export const FrameExtent = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="501" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="86" x="51" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="49" y="33"></rect>
<text class="terminal" x="59" y="53">BETWEEN</text><a xlink:href="#frame_bound" xlink:title="frame_bound">
<rect height="32" width="104" x="157" y="35"></rect>
<rect class="nonterminal" height="32" width="104" x="155" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="167" y="53">frame_bound</text></a><rect height="32" rx="10" width="48" x="281" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="279" y="33"></rect>
<text class="terminal" x="289" y="53">AND</text><a xlink:href="#frame_bound" xlink:title="frame_bound">
<rect height="32" width="104" x="369" y="3"></rect>
<rect class="nonterminal" height="32" width="104" x="367" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="379" y="21">frame_bound</text></a><path class="line" d="m17 17 h2 m20 0 h10 m0 0 h288 m-318 0 h20 m298 0 h20 m-338 0 q10 0 10 10 m318 0 q0 -10 10 -10 m-328 10 v12 m318 0 v-12 m-318 12 q0 10 10 10 m298 0 q10 0 10 -10 m-308 10 h10 m86 0 h10 m0 0 h10 m104 0 h10 m0 0 h10 m48 0 h10 m20 -32 h10 m104 0 h10 m3 0 h-3"></path>
<polygon points="491 17 499 13 499 21"></polygon>
<polygon points="491 17 483 13 483 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
