export const SubjectClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="357" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="80" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SUBJECT</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="151" y="3"></rect>
<rect class="nonterminal" height="32" width="158" x="149" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="161" y="21">string_or_placeholder</text></a><rect height="32" rx="10" width="56" x="151" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="149" y="45"></rect>
<text class="terminal" x="159" y="65">NULL</text>
<path class="line" d="m17 17 h2 m0 0 h10 m80 0 h10 m20 0 h10 m158 0 h10 m-198 0 h20 m178 0 h20 m-218 0 q10 0 10 10 m198 0 q0 -10 10 -10 m-208 10 v24 m198 0 v-24 m-198 24 q0 10 10 10 m178 0 q10 0 10 -10 m-188 10 h10 m56 0 h10 m0 0 h102 m23 -44 h-3"></path>
<polygon points="347 17 355 13 355 21"></polygon>
<polygon points="347 17 339 13 339 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
