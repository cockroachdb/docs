export const CreateTypeStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="179" width="621" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">CREATE</text>
<rect height="32" rx="10" width="54" x="123" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="121" y="1"></rect>
<text class="terminal" x="131" y="21">TYPE</text>
<rect height="32" rx="10" width="34" x="217" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="215" y="33"></rect>
<text class="terminal" x="225" y="53">IF</text>
<rect height="32" rx="10" width="48" x="271" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="269" y="33"></rect>
<text class="terminal" x="279" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="339" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="337" y="33"></rect>
<text class="terminal" x="347" y="53">EXISTS</text><a xlink:href="#type_name" xlink:title="type_name">
<rect height="32" width="92" x="449" y="3"></rect>
<rect class="nonterminal" height="32" width="92" x="447" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="12" class="nonterminal" x="459" y="21">type_name</text></a><rect height="32" rx="10" width="38" x="561" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="559" y="1"></rect>
<text class="terminal" x="569" y="21">AS</text>
<rect height="32" rx="10" width="58" x="265" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="263" y="99"></rect>
<text class="terminal" x="273" y="119">ENUM</text>
<rect height="32" rx="10" width="26" x="343" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="341" y="99"></rect>
<text class="terminal" x="351" y="119">(</text><a xlink:href="#opt_enum_val_list" xlink:title="opt_enum_val_list">
<rect height="32" width="138" x="389" y="101"></rect>
<rect class="nonterminal" height="32" width="138" x="387" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="10" class="nonterminal" x="399" y="119">opt_enum_val_list</text></a><rect height="32" rx="10" width="26" x="265" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="263" y="143"></rect>
<text class="terminal" x="273" y="163">(</text><a xlink:href="#opt_composite_type_list" xlink:title="opt_composite_type_list">
<rect height="32" width="176" x="311" y="145"></rect>
<rect class="nonterminal" height="32" width="176" x="309" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="152" font-size="10" class="nonterminal" x="321" y="163">opt_composite_type_list</text></a><rect height="32" rx="10" width="26" x="567" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="565" y="99"></rect>
<text class="terminal" x="575" y="119">)</text>
<path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m54 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m92 0 h10 m0 0 h10 m38 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-398 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m58 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m138 0 h10 m-302 0 h20 m282 0 h20 m-322 0 q10 0 10 10 m302 0 q0 -10 10 -10 m-312 10 v24 m302 0 v-24 m-302 24 q0 10 10 10 m282 0 q10 0 10 -10 m-292 10 h10 m26 0 h10 m0 0 h10 m176 0 h10 m0 0 h40 m20 -44 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="611 115 619 111 619 119"></polygon>
<polygon points="611 115 603 111 603 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
