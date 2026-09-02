export const SequenceOptionElem2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="693" width="483" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="38" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">AS</text><a xlink:href="#typename" xlink:title="typename">
<rect height="32" width="84" x="109" y="3"></rect>
<rect class="nonterminal" height="32" width="84" x="107" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="119" y="21">typename</text></a><rect height="32" rx="10" width="40" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">NO</text>
<rect height="32" rx="10" width="62" x="131" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="129" y="45"></rect>
<text class="terminal" x="139" y="65">CYCLE</text>
<rect height="32" rx="10" width="92" x="131" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="129" y="89"></rect>
<text class="terminal" x="139" y="109">MINVALUE</text>
<rect height="32" rx="10" width="94" x="131" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="129" y="133"></rect>
<text class="terminal" x="139" y="153">MAXVALUE</text>
<rect height="32" rx="10" width="72" x="51" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="49" y="177"></rect>
<text class="terminal" x="59" y="197">OWNED</text>
<rect height="32" rx="10" width="38" x="143" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="141" y="177"></rect>
<text class="terminal" x="151" y="197">BY</text>
<rect height="32" rx="10" width="58" x="221" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="219" y="177"></rect>
<text class="terminal" x="229" y="197">NONE</text><a xlink:href="#column_path" xlink:title="column_path">
<rect height="32" width="102" x="221" y="223"></rect>
<rect class="nonterminal" height="32" width="102" x="219" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="11" class="nonterminal" x="231" y="241">column_path</text></a><rect height="32" rx="10" width="66" x="71" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="69" y="265"></rect>
<text class="terminal" x="79" y="285">CACHE</text>
<rect height="32" rx="10" width="92" x="71" y="311"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="69" y="309"></rect>
<text class="terminal" x="79" y="329">MINVALUE</text>
<rect height="32" rx="10" width="94" x="71" y="355"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="69" y="353"></rect>
<text class="terminal" x="79" y="373">MAXVALUE</text>
<rect height="32" rx="10" width="100" x="71" y="399"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="69" y="397"></rect>
<text class="terminal" x="79" y="417">INCREMENT</text>
<rect height="32" rx="10" width="38" x="211" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="209" y="429"></rect>
<text class="terminal" x="219" y="449">BY</text>
<rect height="32" rx="10" width="64" x="71" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="69" y="473"></rect>
<text class="terminal" x="79" y="493">START</text>
<rect height="32" rx="10" width="58" x="175" y="507"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="173" y="505"></rect>
<text class="terminal" x="183" y="525">WITH</text><a xlink:href="#signed_iconst64" xlink:title="signed_iconst64">
<rect height="32" width="124" x="309" y="267"></rect>
<rect class="nonterminal" height="32" width="124" x="307" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="319" y="285">signed_iconst64</text></a><rect height="32" rx="10" width="82" x="51" y="551"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="549"></rect>
<text class="terminal" x="59" y="569">RESTART</text>
<rect height="32" rx="10" width="58" x="193" y="615"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="191" y="613"></rect>
<text class="terminal" x="201" y="633">WITH</text><a xlink:href="#signed_iconst64" xlink:title="signed_iconst64">
<rect height="32" width="124" x="291" y="583"></rect>
<rect class="nonterminal" height="32" width="124" x="289" y="581"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="301" y="601">signed_iconst64</text></a><rect height="32" rx="10" width="80" x="51" y="659"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="49" y="657"></rect>
<text class="terminal" x="59" y="677">VIRTUAL</text>
<path class="line" d="m17 17 h2 m20 0 h10 m38 0 h10 m0 0 h10 m84 0 h10 m0 0 h242 m-424 0 h20 m404 0 h20 m-444 0 q10 0 10 10 m424 0 q0 -10 10 -10 m-434 10 v24 m424 0 v-24 m-424 24 q0 10 10 10 m404 0 q10 0 10 -10 m-414 10 h10 m40 0 h10 m20 0 h10 m62 0 h10 m0 0 h32 m-134 0 h20 m114 0 h20 m-154 0 q10 0 10 10 m134 0 q0 -10 10 -10 m-144 10 v24 m134 0 v-24 m-134 24 q0 10 10 10 m114 0 q10 0 10 -10 m-124 10 h10 m92 0 h10 m0 0 h2 m-124 -10 v20 m134 0 v-20 m-134 20 v24 m134 0 v-24 m-134 24 q0 10 10 10 m114 0 q10 0 10 -10 m-124 10 h10 m94 0 h10 m20 -88 h190 m-414 -10 v20 m424 0 v-20 m-424 20 v112 m424 0 v-112 m-424 112 q0 10 10 10 m404 0 q10 0 10 -10 m-414 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m20 0 h10 m58 0 h10 m0 0 h44 m-142 0 h20 m122 0 h20 m-162 0 q10 0 10 10 m142 0 q0 -10 10 -10 m-152 10 v24 m142 0 v-24 m-142 24 q0 10 10 10 m122 0 q10 0 10 -10 m-132 10 h10 m102 0 h10 m20 -44 h92 m-414 -10 v20 m424 0 v-20 m-424 20 v68 m424 0 v-68 m-424 68 q0 10 10 10 m404 0 q10 0 10 -10 m-394 10 h10 m66 0 h10 m0 0 h132 m-238 0 h20 m218 0 h20 m-258 0 q10 0 10 10 m238 0 q0 -10 10 -10 m-248 10 v24 m238 0 v-24 m-238 24 q0 10 10 10 m218 0 q10 0 10 -10 m-228 10 h10 m92 0 h10 m0 0 h106 m-228 -10 v20 m238 0 v-20 m-238 20 v24 m238 0 v-24 m-238 24 q0 10 10 10 m218 0 q10 0 10 -10 m-228 10 h10 m94 0 h10 m0 0 h104 m-228 -10 v20 m238 0 v-20 m-238 20 v24 m238 0 v-24 m-238 24 q0 10 10 10 m218 0 q10 0 10 -10 m-228 10 h10 m100 0 h10 m20 0 h10 m0 0 h48 m-78 0 h20 m58 0 h20 m-98 0 q10 0 10 10 m78 0 q0 -10 10 -10 m-88 10 v12 m78 0 v-12 m-78 12 q0 10 10 10 m58 0 q10 0 10 -10 m-68 10 h10 m38 0 h10 m-208 -42 v20 m238 0 v-20 m-238 20 v56 m238 0 v-56 m-238 56 q0 10 10 10 m218 0 q10 0 10 -10 m-228 10 h10 m64 0 h10 m20 0 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m20 -32 h16 m20 -208 h10 m124 0 h10 m0 0 h2 m-414 -10 v20 m424 0 v-20 m-424 20 v264 m424 0 v-264 m-424 264 q0 10 10 10 m404 0 q10 0 10 -10 m-414 10 h10 m82 0 h10 m20 0 h10 m0 0 h252 m-282 0 h20 m262 0 h20 m-302 0 q10 0 10 10 m282 0 q0 -10 10 -10 m-292 10 v12 m282 0 v-12 m-282 12 q0 10 10 10 m262 0 q10 0 10 -10 m-252 10 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m20 -32 h10 m124 0 h10 m-394 -42 v20 m424 0 v-20 m-424 20 v88 m424 0 v-88 m-424 88 q0 10 10 10 m404 0 q10 0 10 -10 m-414 10 h10 m80 0 h10 m0 0 h304 m23 -656 h-3"></path>
<polygon points="473 17 481 13 481 21"></polygon>
<polygon points="473 17 465 13 465 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
