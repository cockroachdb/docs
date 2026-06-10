export const Privilege = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="169" width="171" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="56" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="61" y="21">name</text></a><rect height="32" rx="10" width="72" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">CREATE</text>
<rect height="32" rx="10" width="66" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">GRANT</text>
<rect height="32" rx="10" width="70" x="51" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="49" y="133"></rect>
<text class="terminal" x="59" y="153">SELECT</text>
<path class="line" d="m17 17 h2 m20 0 h10 m56 0 h10 m0 0 h16 m-112 0 h20 m92 0 h20 m-132 0 q10 0 10 10 m112 0 q0 -10 10 -10 m-122 10 v24 m112 0 v-24 m-112 24 q0 10 10 10 m92 0 q10 0 10 -10 m-102 10 h10 m72 0 h10 m-102 -10 v20 m112 0 v-20 m-112 20 v24 m112 0 v-24 m-112 24 q0 10 10 10 m92 0 q10 0 10 -10 m-102 10 h10 m66 0 h10 m0 0 h6 m-102 -10 v20 m112 0 v-20 m-112 20 v24 m112 0 v-24 m-112 24 q0 10 10 10 m92 0 q10 0 10 -10 m-102 10 h10 m70 0 h10 m0 0 h2 m23 -132 h-3"></path>
<polygon points="161 17 169 13 169 21"></polygon>
<polygon points="161 17 153 13 153 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
