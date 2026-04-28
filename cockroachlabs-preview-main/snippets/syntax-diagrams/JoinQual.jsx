export const JoinQual = () => {
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
<rect height="32" rx="10" width="64" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">USING</text>
<rect height="32" rx="10" width="26" x="135" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="133" y="1"></rect>
<text class="terminal" x="143" y="21">(</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="181" y="3"></rect>
<rect class="nonterminal" height="32" width="82" x="179" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="191" y="21">name_list</text></a><rect height="32" rx="10" width="26" x="283" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="281" y="1"></rect>
<text class="terminal" x="291" y="21">)</text>
<rect height="32" rx="10" width="40" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">ON</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="111" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="109" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="121" y="65">a_expr</text></a><path class="line" d="m17 17 h2 m20 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m-298 0 h20 m278 0 h20 m-318 0 q10 0 10 10 m298 0 q0 -10 10 -10 m-308 10 v24 m298 0 v-24 m-298 24 q0 10 10 10 m278 0 q10 0 10 -10 m-288 10 h10 m40 0 h10 m0 0 h10 m64 0 h10 m0 0 h134 m23 -44 h-3"></path>
<polygon points="347 17 355 13 355 21"></polygon>
<polygon points="347 17 339 13 339 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
