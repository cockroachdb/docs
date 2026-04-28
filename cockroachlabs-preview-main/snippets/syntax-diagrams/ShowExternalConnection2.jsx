export const ShowExternalConnection2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="583" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SHOW</text>
<rect height="32" rx="10" width="90" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">EXTERNAL</text>
<rect height="32" rx="10" width="122" x="245" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="122" x="243" y="1"></rect>
<text class="terminal" x="253" y="21">CONNECTIONS</text>
<rect height="32" rx="10" width="112" x="245" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="243" y="45"></rect>
<text class="terminal" x="253" y="65">CONNECTION</text><a xlink:href="/docs/v24.3/sql-grammar#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="377" y="47"></rect>
<rect class="nonterminal" height="32" width="158" x="375" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="387" y="65">string_or_placeholder</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m90 0 h10 m20 0 h10 m122 0 h10 m0 0 h168 m-330 0 h20 m310 0 h20 m-350 0 q10 0 10 10 m330 0 q0 -10 10 -10 m-340 10 v24 m330 0 v-24 m-330 24 q0 10 10 10 m310 0 q10 0 10 -10 m-320 10 h10 m112 0 h10 m0 0 h10 m158 0 h10 m23 -44 h-3"></path>
<polygon points="573 17 581 13 581 21"></polygon>
<polygon points="573 17 565 13 565 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
