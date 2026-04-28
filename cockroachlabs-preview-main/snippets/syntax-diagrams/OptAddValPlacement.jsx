export const OptAddValPlacement = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="389" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="36" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">IN</text>
<rect height="32" rx="10" width="76" x="107" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="105" y="21"></rect>
<text class="terminal" x="115" y="41">SCHEMA</text><a xlink:href="#schema_name_list" xlink:title="schema_name_list">
<rect height="32" width="138" x="203" y="23"></rect>
<rect class="nonterminal" height="32" width="138" x="201" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="11" class="nonterminal" x="213" y="41">schema_name_list</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h300 m-330 0 h20 m310 0 h20 m-350 0 q10 0 10 10 m330 0 q0 -10 10 -10 m-340 10 v12 m330 0 v-12 m-330 12 q0 10 10 10 m310 0 q10 0 10 -10 m-320 10 h10 m36 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m138 0 h10 m23 -32 h-3"></path>
<polygon points="379 5 387 1 387 9"></polygon>
<polygon points="379 5 371 1 371 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
