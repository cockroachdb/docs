export const CreateScheduleForBackupStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="169" width="739" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="92" x="123" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="121" y="1"></rect>
<text class="terminal" x="131" y="21">SCHEDULE</text><a xlink:href="#schedule_label_spec" xlink:title="schedule_label_spec">
<rect height="32" width="152" x="235" y="3"></rect>
<rect class="nonterminal" height="32" width="152" x="233" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="128" font-size="10" class="nonterminal" x="245" y="21">schedule_label_spec</text></a><rect height="32" rx="10" width="48" x="407" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="405" y="1"></rect>
<text class="terminal" x="415" y="21">FOR</text>
<rect height="32" rx="10" width="74" x="475" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="473" y="1"></rect>
<text class="terminal" x="483" y="21">BACKUP</text><a xlink:href="#opt_backup_targets" xlink:title="opt_backup_targets">
<rect height="32" width="148" x="569" y="3"></rect>
<rect class="nonterminal" height="32" width="148" x="567" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="11" class="nonterminal" x="579" y="21">opt_backup_targets</text></a><rect height="32" rx="10" width="56" x="72" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="70" y="67"></rect>
<text class="terminal" x="80" y="87">INTO</text><a xlink:href="#string_or_placeholder_opt_list" xlink:title="string_or_placeholder_opt_list">
<rect height="32" width="214" x="148" y="69"></rect>
<rect class="nonterminal" height="32" width="214" x="146" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="190" font-size="10" class="nonterminal" x="158" y="87">string_or_placeholder_opt_list</text></a><a xlink:href="#opt_with_backup_options" xlink:title="opt_with_backup_options">
<rect height="32" width="184" x="382" y="69"></rect>
<rect class="nonterminal" height="32" width="184" x="380" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="160" font-size="11" class="nonterminal" x="392" y="87">opt_with_backup_options</text></a><a xlink:href="#cron_expr" xlink:title="cron_expr">
<rect height="32" width="84" x="586" y="69"></rect>
<rect class="nonterminal" height="32" width="84" x="584" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="10" class="nonterminal" x="596" y="87">cron_expr</text></a><a xlink:href="#opt_full_backup_clause" xlink:title="opt_full_backup_clause">
<rect height="32" width="170" x="327" y="135"></rect>
<rect class="nonterminal" height="32" width="170" x="325" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="146" font-size="10" class="nonterminal" x="337" y="153">opt_full_backup_clause</text></a><a xlink:href="#opt_with_schedule_options" xlink:title="opt_with_schedule_options">
<rect height="32" width="194" x="517" y="135"></rect>
<rect class="nonterminal" height="32" width="194" x="515" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="170" font-size="10" class="nonterminal" x="527" y="153">opt_with_schedule_options</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m152 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m148 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-689 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m56 0 h10 m0 0 h10 m214 0 h10 m0 0 h10 m184 0 h10 m0 0 h10 m84 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-387 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m170 0 h10 m0 0 h10 m194 0 h10 m3 0 h-3"></path>
<polygon points="729 149 737 145 737 153"></polygon>
<polygon points="729 149 721 145 721 153"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
