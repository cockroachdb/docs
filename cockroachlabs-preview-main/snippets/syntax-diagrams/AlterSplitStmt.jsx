export const AlterSplitStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="123" width="565" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">ALTER</text>
<rect height="32" rx="10" width="62" x="113" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="111" y="1"></rect>
<text class="terminal" x="121" y="21">TABLE</text><a xlink:href="#table_name" xlink:title="table_name">
<rect height="32" width="96" x="195" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="193" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="205" y="21">table_name</text></a><rect height="32" rx="10" width="60" x="311" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="309" y="1"></rect>
<text class="terminal" x="319" y="21">SPLIT</text>
<rect height="32" rx="10" width="38" x="391" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="389" y="1"></rect>
<text class="terminal" x="399" y="21">AT</text><a xlink:href="#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="449" y="3"></rect>
<rect class="nonterminal" height="32" width="94" x="447" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="459" y="21">select_stmt</text></a><rect height="32" rx="10" width="58" x="249" y="89"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="247" y="87"></rect>
<text class="terminal" x="257" y="107">WITH</text>
<rect height="32" rx="10" width="106" x="327" y="89"></rect>
<rect class="terminal" height="32" rx="10" width="106" x="325" y="87"></rect>
<text class="terminal" x="335" y="107">EXPIRATION</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="453" y="89"></rect>
<rect class="nonterminal" height="32" width="64" x="451" y="87"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="463" y="107">a_expr</text></a><path class="line" d="m17 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m94 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-358 54 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h278 m-308 0 h20 m288 0 h20 m-328 0 q10 0 10 10 m308 0 q0 -10 10 -10 m-318 10 v12 m308 0 v-12 m-308 12 q0 10 10 10 m288 0 q10 0 10 -10 m-298 10 h10 m58 0 h10 m0 0 h10 m106 0 h10 m0 0 h10 m64 0 h10 m23 -32 h-3"></path>
<polygon points="555 71 563 67 563 75"></polygon>
<polygon points="555 71 547 67 547 75"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
