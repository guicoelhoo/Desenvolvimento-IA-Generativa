


// Carregar histórico do localStorage
let historicoConversas = JSON.parse(localStorage.getItem('historicoConversas') || '[]');
let conversaSelecionada = null;

function atualizarSidebar() {
  const sidebar = document.getElementById('sidebar-history');
  if (!sidebar) return;
  sidebar.innerHTML = '';
  historicoConversas.forEach((item, idx) => {
    const li = document.createElement('li');
    // Gera resumo do prontuário e resposta
    const resumoPergunta = (item.prontuarioOriginal || '').split('\n')[0].slice(0, 32) + (item.prontuarioOriginal.length > 32 ? '...' : '');
    const resumoResposta = (item.resposta || '').split('\n')[0].slice(0, 32) + (item.resposta.length > 32 ? '...' : '');
    li.innerHTML = `<div class='fw-bold' style='font-size:0.97em;'>${escapeHtml(resumoPergunta)}</div><div style='font-size:0.93em; color:#555;'>${escapeHtml(resumoResposta)}</div>`;
    li.className = (conversaSelecionada === idx) ? 'active' : '';
    li.onclick = () => mostrarConversa(idx);
    sidebar.appendChild(li);
  });
}

function mostrarConversa(idx) {
  conversaSelecionada = idx;
  atualizarSidebar();
  const respostaDiv = document.getElementById("resposta");
  if (!historicoConversas[idx]) return;
  respostaDiv.textContent = historicoConversas[idx].resposta;
  // Mostra também o prontuário no campo de texto
  document.getElementById("prompt").value = historicoConversas[idx].prontuarioOriginal;
  // Mostra especialidade
  const especialidade = historicoConversas[idx].especialidade;
  const select = document.getElementById("especialidade");
  const campoOutra = document.getElementById("especialidade_outra");
  if (select && campoOutra) {
    if ([...select.options].some(opt => opt.value === especialidade)) {
      select.value = especialidade;
      campoOutra.style.display = 'none';
      campoOutra.value = '';
    } else {
      select.value = 'Outra';
      campoOutra.style.display = '';
      campoOutra.value = especialidade;
    }
  }
}

function salvarHistorico() {
  localStorage.setItem('historicoConversas', JSON.stringify(historicoConversas));
}

async function enviar() {
  const prompt = document.getElementById("prompt").value;
  let especialidade = document.getElementById("especialidade").value;
  const especialidadeOutra = document.getElementById("especialidade_outra").value;
  const respostaDiv = document.getElementById("resposta");

  if (especialidade === "Outra" && especialidadeOutra.trim() !== "") {
    especialidade = especialidadeOutra.trim();
  }

  respostaDiv.textContent = "Processando...";

  // Monta o prompt incluindo a especialidade
  const promptFinal = `Especialidade do médico: ${especialidade}\n${prompt}`;

  try {
    const resp = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user_prompt: promptFinal })
    });

    const data = await resp.json();
    respostaDiv.textContent = data.texto;

    // Adiciona ao histórico (sidebar)
    const titulo = prompt.split('\n')[0].slice(0, 40) || `Conversa ${historicoConversas.length+1}`;
    historicoConversas.unshift({
      titulo: titulo,
      prontuario: promptFinal,
      prontuarioOriginal: prompt,
      especialidade: especialidade,
      resposta: data.texto
    });
    salvarHistorico();
    conversaSelecionada = 0;
    atualizarSidebar();
  } catch (err) {
    respostaDiv.textContent = "Erro: " + err.message;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}


function limparResposta() {
  document.getElementById("resposta").textContent = "";
}

// Inicializa sidebar ao carregar a página e adiciona evento ao botão Nova Conversa
window.addEventListener('DOMContentLoaded', () => {
  atualizarSidebar();
  const btnNova = document.getElementById('nova-conversa-btn');
  if (btnNova) {
    btnNova.onclick = () => {
      conversaSelecionada = null;
      document.getElementById("prompt").value = "";
      document.getElementById("resposta").textContent = "";
      document.getElementById("especialidade").value = "Clínica Geral";
      const campoOutra = document.getElementById("especialidade_outra");
      if (campoOutra) {
        campoOutra.style.display = 'none';
        campoOutra.value = '';
      }
      atualizarSidebar();
    };
  }
});
