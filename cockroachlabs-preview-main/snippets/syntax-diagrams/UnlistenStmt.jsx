export const UnlistenStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="301" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="90" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">UNLISTEN</text><a xlink:href="#type_name" xlink:title="type_name">
<rect height="32" width="92" x="161" y="3"></rect>
<rect class="nonterminal" height="32" width="92" x="159" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="12" class="nonterminal" x="171" y="21">type_name</text></a><rect height="32" rx="10" width="28" x="161" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="28" x="159" y="45"></rect>
<text class="terminal" x="169" y="65">*</text>
<path class="line" d="m17 17 h2 m0 0 h10 m90 0 h10 m20 0 h10 m92 0 h10 m-132 0 h20 m112 0 h20 m-152 0 q10 0 10 10 m132 0 q0 -10 10 -10 m-142 10 v24 m132 0 v-24 m-132 24 q0 10 10 10 m112 0 q10 0 10 -10 m-122 10 h10 m28 0 h10 m0 0 h64 m23 -44 h-3"></path>
<polygon points="291 17 299 13 299 21"></polygon>
<polygon points="291 17 283 13 283 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
