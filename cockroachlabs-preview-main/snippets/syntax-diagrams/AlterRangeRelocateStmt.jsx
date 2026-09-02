export const AlterRangeRelocateStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="235" width="929" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="11 17 3 13 3 21"></polygon>
<polygon points="19 17 11 13 11 21"></polygon>
<rect height="32" rx="10" width="62" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">ALTER</text>
<rect height="32" rx="10" width="66" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">RANGE</text><a xlink:href="#relocate_kw" xlink:title="relocate_kw">
<rect height="32" width="96" x="45" y="69"></rect>
<rect class="nonterminal" height="32" width="96" x="43" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="55" y="87">relocate_kw</text></a><rect height="32" rx="10" width="62" x="181" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="179" y="67"></rect>
<text class="terminal" x="189" y="87">LEASE</text><a xlink:href="#relocate_subject_nonlease" xlink:title="relocate_subject_nonlease">
<rect height="32" width="192" x="181" y="113"></rect>
<rect class="nonterminal" height="32" width="192" x="179" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="168" font-size="10" class="nonterminal" x="191" y="131">relocate_subject_nonlease</text></a><rect height="32" rx="10" width="60" x="393" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="391" y="111"></rect>
<text class="terminal" x="401" y="131">FROM</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="473" y="113"></rect>
<rect class="nonterminal" height="32" width="64" x="471" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="483" y="131">a_expr</text></a><rect height="32" rx="10" width="38" x="577" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="575" y="67"></rect>
<text class="terminal" x="585" y="87">TO</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="635" y="69"></rect>
<rect class="nonterminal" height="32" width="64" x="633" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="645" y="87">a_expr</text></a><rect height="32" rx="10" width="48" x="719" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="717" y="67"></rect>
<text class="terminal" x="727" y="87">FOR</text><a xlink:href="#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="787" y="69"></rect>
<rect class="nonterminal" height="32" width="94" x="785" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="797" y="87">select_stmt</text></a><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="45" y="157"></rect>
<rect class="nonterminal" height="32" width="64" x="43" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="55" y="175">a_expr</text></a><a xlink:href="#relocate_kw" xlink:title="relocate_kw">
<rect height="32" width="96" x="129" y="157"></rect>
<rect class="nonterminal" height="32" width="96" x="127" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="139" y="175">relocate_kw</text></a><rect height="32" rx="10" width="62" x="265" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="263" y="155"></rect>
<text class="terminal" x="273" y="175">LEASE</text><a xlink:href="#relocate_subject_nonlease" xlink:title="relocate_subject_nonlease">
<rect height="32" width="192" x="265" y="201"></rect>
<rect class="nonterminal" height="32" width="192" x="263" y="199"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="168" font-size="10" class="nonterminal" x="275" y="219">relocate_subject_nonlease</text></a><rect height="32" rx="10" width="60" x="477" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="475" y="199"></rect>
<text class="terminal" x="485" y="219">FROM</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="557" y="201"></rect>
<rect class="nonterminal" height="32" width="64" x="555" y="199"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="567" y="219">a_expr</text></a><rect height="32" rx="10" width="38" x="661" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="659" y="155"></rect>
<text class="terminal" x="669" y="175">TO</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="719" y="157"></rect>
<rect class="nonterminal" height="32" width="64" x="717" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="729" y="175">a_expr</text></a><path class="line" d="m19 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m66 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-200 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m96 0 h10 m20 0 h10 m62 0 h10 m0 0 h294 m-396 0 h20 m376 0 h20 m-416 0 q10 0 10 10 m396 0 q0 -10 10 -10 m-406 10 v24 m396 0 v-24 m-396 24 q0 10 10 10 m376 0 q10 0 10 -10 m-386 10 h10 m192 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m64 0 h10 m20 -44 h10 m38 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m94 0 h10 m-876 0 h20 m856 0 h20 m-896 0 q10 0 10 10 m876 0 q0 -10 10 -10 m-886 10 v68 m876 0 v-68 m-876 68 q0 10 10 10 m856 0 q10 0 10 -10 m-866 10 h10 m64 0 h10 m0 0 h10 m96 0 h10 m20 0 h10 m62 0 h10 m0 0 h294 m-396 0 h20 m376 0 h20 m-416 0 q10 0 10 10 m396 0 q0 -10 10 -10 m-406 10 v24 m396 0 v-24 m-396 24 q0 10 10 10 m376 0 q10 0 10 -10 m-386 10 h10 m192 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m64 0 h10 m20 -44 h10 m38 0 h10 m0 0 h10 m64 0 h10 m0 0 h98 m23 -88 h-3"></path>
<polygon points="919 83 927 79 927 87"></polygon>
<polygon points="919 83 911 79 911 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
