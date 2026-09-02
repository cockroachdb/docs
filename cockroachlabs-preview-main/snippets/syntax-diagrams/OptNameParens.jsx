export const OptNameParens = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="247" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="26" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">(</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="97" y="23"></rect>
<rect class="nonterminal" height="32" width="56" x="95" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="107" y="41">name</text></a><rect height="32" rx="10" width="26" x="173" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="171" y="21"></rect>
<text class="terminal" x="181" y="41">)</text>
<path class="line" d="m17 5 h2 m20 0 h10 m0 0 h158 m-188 0 h20 m168 0 h20 m-208 0 q10 0 10 10 m188 0 q0 -10 10 -10 m-198 10 v12 m188 0 v-12 m-188 12 q0 10 10 10 m168 0 q10 0 10 -10 m-178 10 h10 m26 0 h10 m0 0 h10 m56 0 h10 m0 0 h10 m26 0 h10 m23 -32 h-3"></path>
<polygon points="237 5 245 1 245 9"></polygon>
<polygon points="237 5 229 1 229 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
