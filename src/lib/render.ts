import { formatDate, formatNumberText, formatPhone, fullName, sumHours } from './format';
import { inflect } from './options';
import type { CrewMember, Cruise } from './types';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const b = (s: string): string => `<b>${esc(s)}</b>`;

const label = (text: string, plainColon = false): string =>
  plainColon ? `<i>${esc(text)}</i>: ` : `<i>${esc(text)}: </i>`;

const CSS = `
@font-face{font-family:Carlito;font-weight:400;font-style:normal;src:url(/fonts/Carlito-Regular.ttf)}
@font-face{font-family:Carlito;font-weight:700;font-style:normal;src:url(/fonts/Carlito-Bold.ttf)}
@font-face{font-family:Carlito;font-weight:400;font-style:italic;src:url(/fonts/Carlito-Italic.ttf)}
@font-face{font-family:Carlito;font-weight:700;font-style:italic;src:url(/fonts/Carlito-BoldItalic.ttf)}
@page{size:A4;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff}
body{font-family:Carlito,Calibri,sans-serif;font-size:11pt;line-height:14.6pt;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{position:relative;width:595.3pt;min-height:841.9pt;padding:150.8pt 38pt 0 36pt;overflow:hidden;break-after:page;page-break-after:always}
.sheet:last-child{break-after:auto;page-break-after:auto}
.logo{position:absolute;left:19.25pt;top:15.6pt;width:76.5pt;height:79.5pt}
.addr{position:absolute;left:106.9pt;top:35.4pt}
.addr div{height:14.6pt}
h1{position:absolute;left:106.9pt;top:114.7pt;margin:0;font-size:19pt;line-height:26pt;font-weight:700;text-decoration:underline;white-space:nowrap}
.photo{position:absolute;object-fit:cover;box-shadow:0 2pt 7pt rgba(0,0,0,.4)}
.photo.crew{left:322.85pt;top:56.7pt;width:245.7pt;height:184.3pt}
.photo.yacht{left:282.6pt;top:12.6pt;width:254.25pt;height:169.5pt}
.rel{position:relative;display:flow-root}
.sec{margin-top:10pt}
.narrow{max-width:280pt}
.u{text-decoration:underline}
.pre{white-space:pre-wrap;overflow-wrap:anywhere}
table{border-collapse:collapse;margin:12pt 0 0 -.25pt;width:461.6pt;table-layout:fixed}
td,th{border:.5pt solid #7f7f7f;text-align:center;padding:2.4pt 0;font-weight:400}
td{font-weight:700}
sup{font-size:7.3pt;line-height:0;vertical-align:baseline;position:relative;top:-4pt}
.after-table{margin-top:22pt}
.sign{margin:24.6pt 0 0 304.8pt}
.empty{height:14.6pt}
`;

const row = (inner: string, cls = ''): string => `<div class="${cls}">${inner}</div>`;

function imageUrl(c: Cruise, slot: 'crew' | 'yacht'): string | null {
  const v = c.images[slot];
  return v ? `/api/cruises/${c.id}/images/${slot}?v=${encodeURIComponent(v)}` : null;
}

export function renderOpinion(c: Cruise, m: CrewMember): string {
  const g = m.gender;
  const patent = m.patent.trim() || '-';
  const crewImg = imageUrl(c, 'crew');
  const yachtImg = imageUrl(c, 'yacht');
  const names = c.crew.map(fullName).filter(Boolean);
  const phone = formatPhone(c.captain.phone);
  const captainLine = [
    c.captain.name,
    c.captain.patent,
    phone && `tel. ${phone}`,
    c.captain.email && `mail: ${c.captain.email}`
  ]
    .filter(Boolean)
    .join(', ');

  return `<section class="sheet">
<img class="logo" src="/akz-logo.png" alt="">
<div class="addr"><div>Akademicki Klub Żeglarski AGH</div><div>ul. Reymonta 21a</div><div>30-059 Kraków</div></div>
<h1>OPINIA Z REJSU</h1>
${crewImg ? `<img class="photo crew" src="${esc(crewImg)}" alt="">` : ''}
${row('<span class="u">Informacje o załogancie:</span>')}
${row(b(`${fullName(m)}, ${m.rank}, ${patent}`), 'narrow')}
${row(`<i>Uczestniczył/a w rejsie </i>z cyklu: ${b(c.series)}`, 'narrow')}
${row(`${label('Pełniona funkcja', true)}${b(inflect(m.role, g))}`, 'narrow')}
${row(`${label('Z obowiązków wywiązywał/a się', true)}${b(m.duty)}`, 'narrow')}
${row(`${label('Chorobie morskiej', true)}${b(inflect(m.seasickness, g))}`, 'narrow')}
${row(`${label('Odporność w trudnych warunkach')}${b(m.resistance)}`, 'narrow')}
${row(`${label('Nadaje się do')}${b(m.suitableFor)}`, 'narrow')}
${row(`${label('Uwagi kapitana')}<b class="pre">${esc(m.remarks.trim())}</b>`)}
<div class="rel">
${yachtImg ? `<img class="photo yacht" src="${esc(yachtImg)}" alt="">` : ''}
<div class="sec narrow">
${row('<span class="u">Informacje o jachcie:</span>')}
${row(`${label('Typ jachtu')}${b(c.yacht.type)}`)}
${row(`${label('Klasa Jachtu')}${b(c.yacht.class)}`)}
${row(`${label('Nazwa Jachtu')}${b(c.yacht.name)}`)}
${row(`${label('Długość całkowita jachtu')}${b(`${formatNumberText(c.yacht.length)} m`)}`)}
</div>
<div class="sec narrow">
${row('<span class="u">Podstawowe informacje o rejsie:</span>')}
${row(`${label('Zaokrętowano', true)}${b(c.embark.port)}, ${b(formatDate(c.embark.date))}`)}
${row(`${label('Wyokrętowano', true)}${b(c.disembark.port)}, ${b(formatDate(c.disembark.date))}`)}
${row(`${label('Odwiedzono porty', true)}${b(c.visitedPorts)}`)}
${c.tidal ? row('<i>Rejs na wodach pływowych</i>') : ''}
</div>
</div>
<div class="sec">${row('<span class="u">Zestawienie godzinowe rejsu:</span>')}</div>
<table>
<tr><th>Postój <i>h</i></th><th>Żagle <i>h</i></th><th>Silnik <i>h</i></th><th>Suma godzin</th><th>Powyżej 6<sup>0</sup>B <i>h</i></th><th>Przebyto Nm</th></tr>
<tr><td>${esc(formatNumberText(c.hours.harbour))}</td><td>${esc(formatNumberText(c.hours.sails))}</td><td>${esc(formatNumberText(c.hours.engine))}</td><td>${esc(sumHours(c.hours.sails, c.hours.engine))}</td><td>${esc(formatNumberText(c.hours.above6B))}</td><td>${esc(formatNumberText(c.hours.miles))}</td></tr>
</table>
<div class="after-table">${row('<span class="u">Skład Załogi:</span>')}</div>
${row(b(names.map((n) => `${n},`).join(' ')), 'sec pre')}
<div class="sec">${row('<span class="u">Uwagi od kapitana o przebiegu rejsu:</span>')}
${row(`<b class="pre">${esc(c.captainRemarks.trim())}</b>`)}</div>
<div class="sec">${row('<span class="u">Kapitan:</span>')}
${row(b(captainLine))}</div>
<div class="sign">Podpis Kapitana:</div>
</section>`;
}

export function renderDocument(c: Cruise, members: CrewMember[], title = 'Opinia z rejsu'): string {
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${CSS}</style></head>
<body>${members.map((m) => renderOpinion(c, m)).join('\n')}</body></html>`;
}
