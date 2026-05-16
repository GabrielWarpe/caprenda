// =====================
// MÓDULOS - ABRIR
// =====================
function abrirModulo(nomeModulo) {
  var paginas = {
    'intro':     'modulos/introducao/index.html',
    'variaveis': 'modulos/variaveis/index.html',
    'controle':  'modulos/controle/index.html',
    'funcoes':   'modulos/funcoes/index.html'
  };
  if (paginas[nomeModulo]) {
    window.location.href = paginas[nomeModulo];
  }
}

// =====================
// PROGRESSO
// =====================
var ORDEM = ['intro', 'variaveis', 'controle', 'funcoes'];

function carregarProgresso() {
  var modulos = {
    'intro':     { fillId: 'fill-intro',     labelId: 'label-intro'     },
    'variaveis': { fillId: 'fill-variaveis', labelId: 'label-variaveis' },
    'controle':  { fillId: 'fill-controle',  labelId: 'label-controle'  },
    'funcoes':   { fillId: 'fill-funcoes',   labelId: 'label-funcoes'   }
  };
  Object.keys(modulos).forEach(function(modulo) {
    var pct     = parseInt(localStorage.getItem('prog_' + modulo)) || 0;
    var fillEl  = document.getElementById(modulos[modulo].fillId);
    var labelEl = document.getElementById(modulos[modulo].labelId);
    if (fillEl)  fillEl.style.width = pct + '%';
    if (labelEl) {
      if (pct === 0)        labelEl.textContent = 'Não iniciado';
      else if (pct === 100) { labelEl.textContent = 'Completo ✓'; labelEl.className = 'progress-label completo'; }
      else                  labelEl.textContent = pct + '% concluído';
    }
  });
  atualizarPainelGeral();
}

function atualizarPainelGeral() {
  var total = 0;
  ORDEM.forEach(function(m) { total += parseInt(localStorage.getItem('prog_' + m) || 0); });
  var media = Math.round(total / ORDEM.length);
  var fillEl = document.getElementById('painel-fill');
  var pctEl  = document.getElementById('painel-pct');
  var descEl = document.getElementById('painel-desc');
  if (fillEl) fillEl.style.width = media + '%';
  if (pctEl)  pctEl.textContent  = media + '%';
  if (descEl) {
    var conc = ORDEM.filter(function(m) { return parseInt(localStorage.getItem('prog_' + m) || 0) >= 100; }).length;
    if (media === 0)   descEl.textContent = 'Você ainda não começou nenhum módulo.';
    else if (conc === 4) descEl.textContent = 'Trilha concluída! Parabéns!';
    else               descEl.textContent = conc + ' de 4 módulo(s) concluído(s).';
  }
}

function resetarProgresso() {
  if (!confirm('Resetar todo o progresso?')) return;
  ORDEM.forEach(function(m) { localStorage.removeItem('prog_' + m); });
  carregarProgresso();
}

window.addEventListener('pageshow', function() {
  carregarProgresso();
});
