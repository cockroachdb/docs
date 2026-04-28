export const OptClearData = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="567" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="44" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SET</text>
<rect height="32" rx="10" width="82" x="115" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="113" y="33"></rect>
<text class="terminal" x="123" y="53">SESSION</text>
<rect height="32" rx="10" width="120" x="237" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="120" x="235" y="1"></rect>
<text class="terminal" x="245" y="21">TRANSACTION</text><a xlink:href="#transaction_mode_list" xlink:title="transaction_mode_list">
<rect height="32" width="162" x="377" y="3"></rect>
<rect class="nonterminal" height="32" width="162" x="375" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="138" font-size="10" class="nonterminal" x="387" y="21">transaction_mode_list</text></a><path class="line" d="m17 17 h2 m0 0 h10 m44 0 h10 m20 0 h10 m0 0 h92 m-122 0 h20 m102 0 h20 m-142 0 q10 0 10 10 m122 0 q0 -10 10 -10 m-132 10 v12 m122 0 v-12 m-122 12 q0 10 10 10 m102 0 q10 0 10 -10 m-112 10 h10 m82 0 h10 m20 -32 h10 m120 0 h10 m0 0 h10 m162 0 h10 m3 0 h-3"></path>
<polygon points="557 17 565 13 565 21"></polygon>
<polygon points="557 17 549 13 549 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
