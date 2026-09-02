export const SequenceOptionElem = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="769" width="597" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="11" class="nonterminal" x="231" y="241">column_path</text></a><rect height="32" rx="10" width="46" x="91" y="299"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="89" y="297"></rect>
<text class="terminal" x="99" y="317">PER</text>
<rect height="32" rx="10" width="58" x="177" y="299"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="175" y="297"></rect>
<text class="terminal" x="185" y="317">NODE</text>
<rect height="32" rx="10" width="82" x="177" y="343"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="175" y="341"></rect>
<text class="terminal" x="185" y="361">SESSION</text>
<rect height="32" rx="10" width="66" x="319" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="317" y="265"></rect>
<text class="terminal" x="327" y="285">CACHE</text>
<rect height="32" rx="10" width="92" x="71" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="69" y="385"></rect>
<text class="terminal" x="79" y="405">MINVALUE</text>
<rect height="32" rx="10" width="94" x="71" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="69" y="429"></rect>
<text class="terminal" x="79" y="449">MAXVALUE</text>
<rect height="32" rx="10" width="100" x="71" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="69" y="473"></rect>
<text class="terminal" x="79" y="493">INCREMENT</text>
<rect height="32" rx="10" width="38" x="211" y="507"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="209" y="505"></rect>
<text class="terminal" x="219" y="525">BY</text>
<rect height="32" rx="10" width="64" x="71" y="551"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="69" y="549"></rect>
<text class="terminal" x="79" y="569">START</text>
<rect height="32" rx="10" width="58" x="175" y="583"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="173" y="581"></rect>
<text class="terminal" x="183" y="601">WITH</text><a xlink:href="#signed_iconst64" xlink:title="signed_iconst64">
<rect height="32" width="124" x="425" y="267"></rect>
<rect class="nonterminal" height="32" width="124" x="423" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="435" y="285">signed_iconst64</text></a><rect height="32" rx="10" width="82" x="51" y="627"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="625"></rect>
<text class="terminal" x="59" y="645">RESTART</text>
<rect height="32" rx="10" width="58" x="193" y="691"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="191" y="689"></rect>
<text class="terminal" x="201" y="709">WITH</text><a xlink:href="#signed_iconst64" xlink:title="signed_iconst64">
<rect height="32" width="124" x="291" y="659"></rect>
<rect class="nonterminal" height="32" width="124" x="289" y="657"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="301" y="677">signed_iconst64</text></a><rect height="32" rx="10" width="80" x="51" y="735"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="49" y="733"></rect>
<text class="terminal" x="59" y="753">VIRTUAL</text>
<path class="line" d="m17 17 h2 m20 0 h10 m38 0 h10 m0 0 h10 m84 0 h10 m0 0 h356 m-538 0 h20 m518 0 h20 m-558 0 q10 0 10 10 m538 0 q0 -10 10 -10 m-548 10 v24 m538 0 v-24 m-538 24 q0 10 10 10 m518 0 q10 0 10 -10 m-528 10 h10 m40 0 h10 m20 0 h10 m62 0 h10 m0 0 h32 m-134 0 h20 m114 0 h20 m-154 0 q10 0 10 10 m134 0 q0 -10 10 -10 m-144 10 v24 m134 0 v-24 m-134 24 q0 10 10 10 m114 0 q10 0 10 -10 m-124 10 h10 m92 0 h10 m0 0 h2 m-124 -10 v20 m134 0 v-20 m-134 20 v24 m134 0 v-24 m-134 24 q0 10 10 10 m114 0 q10 0 10 -10 m-124 10 h10 m94 0 h10 m20 -88 h304 m-528 -10 v20 m538 0 v-20 m-538 20 v112 m538 0 v-112 m-538 112 q0 10 10 10 m518 0 q10 0 10 -10 m-528 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m20 0 h10 m58 0 h10 m0 0 h44 m-142 0 h20 m122 0 h20 m-162 0 q10 0 10 10 m142 0 q0 -10 10 -10 m-152 10 v24 m142 0 v-24 m-142 24 q0 10 10 10 m122 0 q10 0 10 -10 m-132 10 h10 m102 0 h10 m20 -44 h206 m-528 -10 v20 m538 0 v-20 m-538 20 v68 m538 0 v-68 m-538 68 q0 10 10 10 m518 0 q10 0 10 -10 m-488 10 h10 m0 0 h198 m-228 0 h20 m208 0 h20 m-248 0 q10 0 10 10 m228 0 q0 -10 10 -10 m-238 10 v12 m228 0 v-12 m-228 12 q0 10 10 10 m208 0 q10 0 10 -10 m-218 10 h10 m46 0 h10 m20 0 h10 m58 0 h10 m0 0 h24 m-122 0 h20 m102 0 h20 m-142 0 q10 0 10 10 m122 0 q0 -10 10 -10 m-132 10 v24 m122 0 v-24 m-122 24 q0 10 10 10 m102 0 q10 0 10 -10 m-112 10 h10 m82 0 h10 m40 -76 h10 m66 0 h10 m-354 0 h20 m334 0 h20 m-374 0 q10 0 10 10 m354 0 q0 -10 10 -10 m-364 10 v100 m354 0 v-100 m-354 100 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m92 0 h10 m0 0 h222 m-344 -10 v20 m354 0 v-20 m-354 20 v24 m354 0 v-24 m-354 24 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m94 0 h10 m0 0 h220 m-344 -10 v20 m354 0 v-20 m-354 20 v24 m354 0 v-24 m-354 24 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m100 0 h10 m20 0 h10 m0 0 h48 m-78 0 h20 m58 0 h20 m-98 0 q10 0 10 10 m78 0 q0 -10 10 -10 m-88 10 v12 m78 0 v-12 m-78 12 q0 10 10 10 m58 0 q10 0 10 -10 m-68 10 h10 m38 0 h10 m20 -32 h116 m-344 -10 v20 m354 0 v-20 m-354 20 v56 m354 0 v-56 m-354 56 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m64 0 h10 m20 0 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m20 -32 h132 m20 -284 h10 m124 0 h10 m-528 -10 v20 m538 0 v-20 m-538 20 v340 m538 0 v-340 m-538 340 q0 10 10 10 m518 0 q10 0 10 -10 m-528 10 h10 m82 0 h10 m20 0 h10 m0 0 h252 m-282 0 h20 m262 0 h20 m-302 0 q10 0 10 10 m282 0 q0 -10 10 -10 m-292 10 v12 m282 0 v-12 m-282 12 q0 10 10 10 m262 0 q10 0 10 -10 m-252 10 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m20 -32 h10 m124 0 h10 m20 -32 h114 m-528 -10 v20 m538 0 v-20 m-538 20 v88 m538 0 v-88 m-538 88 q0 10 10 10 m518 0 q10 0 10 -10 m-528 10 h10 m80 0 h10 m0 0 h418 m23 -732 h-3"></path>
<polygon points="587 17 595 13 595 21"></polygon>
<polygon points="587 17 579 13 579 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
