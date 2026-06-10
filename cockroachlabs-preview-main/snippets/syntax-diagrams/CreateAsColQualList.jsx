export const CreateAsColQualList = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="291" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 51 1 47 1 55"></polygon>
<polygon points="17 51 9 47 9 55"></polygon><a xlink:href="#create_as_col_qualification" xlink:title="create_as_col_qualification">
<rect height="32" width="192" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="192" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="168" font-size="10" class="nonterminal" x="61" y="21">create_as_col_qualification</text></a><path class="line" d="m17 51 h2 m20 0 h10 m0 0 h202 m-232 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -14 q0 -10 10 -10 m212 34 l20 0 m-20 0 q10 0 10 -10 l0 -14 q0 -10 -10 -10 m-212 0 h10 m192 0 h10 m23 34 h-3"></path>
<polygon points="281 51 289 47 289 55"></polygon>
<polygon points="281 51 273 47 273 55"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
