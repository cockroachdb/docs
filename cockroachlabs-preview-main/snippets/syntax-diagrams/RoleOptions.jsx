export const RoleOptions = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="53" width="191" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 33 9 29 9 37"></polygon><a xlink:href="#role_option" xlink:title="role_option">
<rect height="32" width="92" x="51" y="19"></rect>
<rect class="nonterminal" height="32" width="92" x="49" y="17"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="61" y="37">role_option</text></a><path class="line" d="m17 33 h2 m20 0 h10 m92 0 h10 m-132 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m112 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-112 0 h10 m0 0 h102 m23 32 h-3"></path>
<polygon points="181 33 189 29 189 37"></polygon>
<polygon points="181 33 173 29 173 37"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
