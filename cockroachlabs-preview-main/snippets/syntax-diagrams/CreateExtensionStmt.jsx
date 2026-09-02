export const CreateExtensionStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="579" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CREATE</text>
<rect height="32" rx="10" width="100" x="123" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="121" y="1"></rect>
<text class="terminal" x="131" y="21">EXTENSION</text>
<rect height="32" rx="10" width="34" x="263" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="261" y="33"></rect>
<text class="terminal" x="271" y="53">IF</text>
<rect height="32" rx="10" width="48" x="317" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="315" y="33"></rect>
<text class="terminal" x="325" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="385" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="383" y="33"></rect>
<text class="terminal" x="393" y="53">EXISTS</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="495" y="3"></rect>
<rect class="nonterminal" height="32" width="56" x="493" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="505" y="21">name</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m100 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m56 0 h10 m3 0 h-3"></path>
<polygon points="569 17 577 13 577 21"></polygon>
<polygon points="569 17 561 13 561 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
