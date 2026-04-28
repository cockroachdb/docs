export const AlterColumnVisible = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="53" width="253" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 33 1 29 1 37"></polygon>
<polygon points="17 33 9 29 9 37"></polygon><a xlink:href="#identity_option_elem" xlink:title="identity_option_elem">
<rect height="32" width="154" x="51" y="19"></rect>
<rect class="nonterminal" height="32" width="154" x="49" y="17"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="10" class="nonterminal" x="61" y="37">identity_option_elem</text></a><path class="line" d="m17 33 h2 m20 0 h10 m154 0 h10 m-194 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m174 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-174 0 h10 m0 0 h164 m23 32 h-3"></path>
<polygon points="243 33 251 29 251 37"></polygon>
<polygon points="243 33 235 29 235 37"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
