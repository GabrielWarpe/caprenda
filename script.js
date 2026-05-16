// ============================================
// JUDGE0 — COMPILAR E EXECUTAR CÓDIGO C
// ============================================
var JUDGE0_URL = "https://ce.judge0.com";
var LANGUAGE_ID_C = 50;

async function executar(numExercicio, saidaEsperada) {
  var editor     = document.getElementById("editor-" + numExercicio);
  var saidaEl    = document.getElementById("saida-"  + numExercicio);
  var feedbackEl = document.getElementById("feedback-" + numExercicio);
  var btnEl      = document.getElementById("btn-"    + numExercicio);
  var spinEl     = document.getElementById("spin-"   + numExercicio);
  var codigo = editor ? editor.value.trim() : "";

  if (!codigo) {
    saidaEl.className = "terminal-output erro";
    saidaEl.textContent = "O editor esta vazio. Escreva seu codigo antes de executar!";
    return;
  }

  btnEl.disabled = true;
  spinEl.classList.add("ativo");
  saidaEl.className = "terminal-output aguardando";
  saidaEl.textContent = "Compilando e executando...";
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback-exercicio";

  try {
    var resposta = await fetch(JUDGE0_URL + "/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_code: codigo, language_id: LANGUAGE_ID_C })
    });
    var resultado = await resposta.json();
    if (resultado.status_id <= 2 && resultado.token) {
      resultado = await aguardarResultado(resultado.token);
    }
    mostrarResultado(numExercicio, resultado, saidaEsperada);
  } catch (erro) {
    saidaEl.className = "terminal-output erro";
    saidaEl.textContent = "Erro de conexao: " + erro.message;
  } finally {
    btnEl.disabled = false;
    spinEl.classList.remove("ativo");
  }
}

async function aguardarResultado(token) {
  for (var i = 0; i < 20; i++) {
    await esperar(1500);
    var r = await fetch(JUDGE0_URL + "/submissions/" + token + "?base64_encoded=false&fields=stdout,stderr,status_id,compile_output");
    var res = await r.json();
    if (res.status_id > 2) return res;
  }
  throw new Error("O servidor demorou demais. Tente novamente.");
}

function esperar(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

function mostrarResultado(numExercicio, resultado, saidaEsperada) {
  var saidaEl    = document.getElementById("saida-"    + numExercicio);
  var feedbackEl = document.getElementById("feedback-" + numExercicio);

  if (resultado.status_id === 6) {
    saidaEl.className = "terminal-output erro";
    saidaEl.textContent = "Erro de compilacao: " + (resultado.compile_output || "Verifique seu codigo.");
    feedbackEl.className = "feedback-exercicio errado";
    feedbackEl.textContent = "✗ Erro no codigo — leia o erro acima e tente corrigir";
    return;
  }
  if (resultado.stderr) {
    saidaEl.className = "terminal-output erro";
    saidaEl.textContent = resultado.stderr;
    feedbackEl.className = "feedback-exercicio errado";
    feedbackEl.textContent = "✗ Erro durante a execucao";
    return;
  }
  var saida = (resultado.stdout || "").trim();
  saidaEl.className = "terminal-output";
  saidaEl.textContent = saida || "(programa executou sem imprimir nada)";

  if (saida === saidaEsperada.trim()) {
    feedbackEl.className = "feedback-exercicio certo";
    feedbackEl.textContent = "✓ Correto! Parabens!";
    if (typeof marcarConcluido === "function") marcarConcluido(numExercicio);
  } else {
    feedbackEl.className = "feedback-exercicio errado";
    feedbackEl.textContent = "✗ Quase! A saida nao esta igual ao esperado. Tente novamente.";
  }
}

function limparEditor(numExercicio) {
  if (confirm("Deseja limpar o codigo deste exercicio?")) {
    var editor = document.getElementById("editor-" + numExercicio);
    if (editor) editor.value = "";
    var saida = document.getElementById("saida-" + numExercicio);
    if (saida) { saida.className = "terminal-output aguardando"; saida.textContent = "Clique em Executar para ver o resultado..."; }
    var fb = document.getElementById("feedback-" + numExercicio);
    if (fb) { fb.textContent = ""; fb.className = "feedback-exercicio"; }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".editor-codigo").forEach(function(editor) {
    editor.addEventListener("keydown", function(e) {
      if (e.key === "Tab") {
        e.preventDefault();
        var pos = this.selectionStart;
        this.value = this.value.substring(0, pos) + "    " + this.value.substring(this.selectionEnd);
        this.selectionStart = this.selectionEnd = pos + 4;
      }
    });
  });
});


var concluidos = { quiz: false, ctrl_1: false, ctrl_2: false };
var QUIZZES = [
  {p:'Qual operador compara igualdade em C?', o:['=','==','===','!='], c:1},
  {p:'O que o "break" faz no switch?', o:['Volta ao início','Encerra o loop','Sai do case atual','Imprime uma linha'], c:2},
  {p:'Qual laço garante executar ao menos uma vez?', o:['for','while','do-while','switch'], c:2},
  {p:'O for "for(i=0; i<3; i++)" executa quantas vezes?', o:['2','3','4','1'], c:1},
  {p:'Para somar todos de 1 a 100 qual estrutura usar?', o:['if/else','switch','for ou while','printf'], c:2},
  {p:'O que acontece se esquecer o break no switch?', o:['Erro','Executa só o case correto','Executa os cases seguintes também','Programa encerra'], c:2}
];
function renderizarQuiz() {
  var letras = ['A','B','C','D']; var html = '';
  QUIZZES.forEach(function(q, i) {
    html += '<div class="quiz-item"><div class="quiz-pergunta"><span class="quiz-pergunta-num">Questão ' + (i+1) + ' de ' + QUIZZES.length + '</span>' + q.p + '</div><div class="quiz-opcoes">';
    q.o.forEach(function(op, oi) { html += '<label class="quiz-opcao"><input type="radio" name="q' + i + '" value="' + oi + '"> <span>' + letras[oi] + ') ' + op + '</span></label>'; });
    html += '</div></div>';
  });
  document.getElementById('quiz-controle').innerHTML = html;
  document.getElementById('excount-controle').textContent = '— 0/' + QUIZZES.length + ' corretos';
}
function verificarQuiz() {
  var acertos = 0; var tudoRespondido = true;
  QUIZZES.forEach(function(q, i) {
    var sel = document.querySelector('input[name="q' + i + '"]:checked');
    document.querySelectorAll('input[name="q' + i + '"]').forEach(function(inp) { inp.parentElement.classList.remove('correta-marcada','errada-marcada'); inp.disabled = true; });
    if (!sel) { tudoRespondido = false; document.querySelectorAll('input[name="q' + i + '"]').forEach(function(inp) { inp.disabled = false; }); return; }
    if (parseInt(sel.value) === q.c) { sel.parentElement.classList.add('correta-marcada'); acertos++; }
    else { sel.parentElement.classList.add('errada-marcada'); var corr = document.querySelector('input[name="q' + i + '"][value="' + q.c + '"]'); if (corr) corr.parentElement.classList.add('correta-marcada'); }
  });
  var res = document.getElementById('res-controle');
  if (!tudoRespondido) { res.textContent = 'Responda todas as questoes antes de verificar.'; res.className = 'quiz-resultado parcial'; return; }
  var pct = Math.round((acertos / QUIZZES.length) * 100);
  document.getElementById('excount-controle').textContent = '— ' + acertos + '/' + QUIZZES.length + ' corretos';
  if (acertos === QUIZZES.length) { res.textContent = 'Perfeito! Voce acertou todas!'; res.className = 'quiz-resultado certo'; }
  else if (acertos >= Math.ceil(QUIZZES.length/2)) { res.textContent = 'Voce acertou ' + acertos + ' de ' + QUIZZES.length + '. Bom trabalho!'; res.className = 'quiz-resultado parcial'; }
  else { res.textContent = 'Voce acertou ' + acertos + ' de ' + QUIZZES.length + '. Revise a teoria.'; res.className = 'quiz-resultado errado'; }
  var btn = document.getElementById('btn-quiz-controle'); if (btn) { btn.disabled = true; btn.textContent = 'Verificado'; }
  if (!concluidos.quiz) { concluidos.quiz = true; localStorage.setItem('modulo_controle_quiz', pct); atualizarProgresso(); }
}
function marcarConcluido(exId) { if (concluidos[exId]) return; concluidos[exId] = true; localStorage.setItem('modulo_controle_' + exId, 'true'); atualizarProgresso(); }
function atualizarProgresso() {
  var codOk = (concluidos['ctrl_1'] ? 1 : 0) + (concluidos['ctrl_2'] ? 1 : 0);
  var quizPct = parseInt(localStorage.getItem('modulo_controle_quiz') || 0);
  var pct = Math.round((quizPct * 0.6) + (codOk / 2 * 100 * 0.4));
  document.getElementById('barra-progresso').style.width = pct + '%';
  document.getElementById('texto-progresso').textContent = 'Quiz: ' + (quizPct > 0 ? 'feito' : 'pendente') + ' · Codigo: ' + codOk + ' de 2';
  document.getElementById('pct-progresso').textContent = pct + '%';
  localStorage.setItem('prog_controle', pct);
}
function irPara(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
document.addEventListener("DOMContentLoaded", function() {
  renderizarQuiz();
  if (localStorage.getItem('modulo_controle_quiz')) concluidos.quiz = true;
  if (localStorage.getItem('modulo_controle_ctrl_1') === 'true') concluidos['ctrl_1'] = true;
  if (localStorage.getItem('modulo_controle_ctrl_2') === 'true') concluidos['ctrl_2'] = true;
  atualizarProgresso();
});

document.querySelectorAll('.sidebar-item').forEach(function(item) {
  item.addEventListener('click', function() {
    document.querySelectorAll('.sidebar-item').forEach(function(i) {
      i.classList.remove('ativo');
    });
    this.classList.add('ativo');
  });
});