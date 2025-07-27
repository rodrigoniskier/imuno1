// script.js
// Código JavaScript principal para a plataforma Imunologia Interativa

// Função utilitária para buscar arquivos JSON
function fetchData(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar ' + url);
      }
      return response.json();
    });
}

// Variável global para armazenar o banco de questões
let bancoQuestoes = [];

document.addEventListener('DOMContentLoaded', () => {
  // Carrega o banco de questões na inicialização
  fetchData('questoes.json').then((data) => {
    bancoQuestoes = data;
  }).catch((error) => console.error(error));

  // Listener do menu lateral para carregar módulos ou referências
  const menu = document.getElementById('menu-lateral');
  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-modulo]');
    if (!link) return;
    event.preventDefault();
    const modulo = link.getAttribute('data-modulo');
    if (modulo === 'referencias') {
      renderizarReferencias();
    } else {
      carregarModulo(modulo);
    }
    // Oculta prova quando navegando para outro conteúdo
    document.getElementById('prova-container').classList.add('hidden');
  });

  // Botão de abrir modal de prova
  const gerarProvaBtn = document.getElementById('gerar-prova-btn');
  gerarProvaBtn.addEventListener('click', () => {
    document.getElementById('modal-prova').classList.remove('hidden');
  });

  // Botão de fechar modal
  const closeModalBtn = document.getElementById('close-modal');
  closeModalBtn.addEventListener('click', () => {
    document.getElementById('modal-prova').classList.add('hidden');
  });

  // Botão de confirmar geração da prova
  const confirmarProvaBtn = document.getElementById('confirmar-gerar-prova');
  confirmarProvaBtn.addEventListener('click', (event) => {
    event.preventDefault();
    gerarProvaSimulada();
  });

  // Delegação de eventos na área de conteúdo para flashcards, acordeão e quiz
  const areaConteudo = document.getElementById('area-conteudo');
  areaConteudo.addEventListener('click', (event) => {
    // Gira flashcards
    const card = event.target.closest('.flashcard');
    if (card) {
      card.classList.toggle('virado');
      return;
    }
    // Acordeão
    const tituloAcc = event.target.closest('.acordeao-titulo');
    if (tituloAcc) {
      const panel = tituloAcc.nextElementSibling;
      panel.classList.toggle('open');
      tituloAcc.classList.toggle('ativo');
      return;
    }
    // Botão de quiz do módulo
    const quizBtn = event.target.closest('button[data-quiz]');
    if (quizBtn) {
      const mod = quizBtn.getAttribute('data-quiz');
      renderizarQuiz(mod);
      return;
    }
  });
});

// Carrega um módulo específico e renderiza seu conteúdo
function carregarModulo(id) {
  fetchData(`modulo${id}.json`)
    .then((data) => {
      renderizarModulo(data);
    })
    .catch((error) => console.error(error));
}

// Renderiza o conteúdo do módulo na área de conteúdo
function renderizarModulo(data) {
  const area = document.getElementById('area-conteudo');
  area.innerHTML = '';
  // Título do módulo
  const modTitle = document.createElement('h2');
  modTitle.textContent = data.titulo;
  area.appendChild(modTitle);
  // Itera sobre os subtópicos
  data.subtopicos.forEach((sub) => {
    const section = document.createElement('article');
    // Título do subtópico
    const h3 = document.createElement('h3');
    h3.textContent = sub.titulo;
    section.appendChild(h3);
    // Conteúdo
    const conteudoDiv = document.createElement('div');
    conteudoDiv.innerHTML = sub.conteudo;
    section.appendChild(conteudoDiv);
    // Imagens
    if (Array.isArray(sub.imagens)) {
      sub.imagens.forEach((img) => {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        image.src = img.src;
        image.alt = img.descricao_detalhada || img.legenda;
        figure.appendChild(image);
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = img.legenda;
        figure.appendChild(figcaption);
        section.appendChild(figure);
      });
    }
    // Flashcards
    if (Array.isArray(sub.flashcards) && sub.flashcards.length > 0) {
      const flashContainer = document.createElement('div');
      flashContainer.className = 'flashcards-container';
      sub.flashcards.forEach((cardData) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'flashcard';
        const frente = document.createElement('div');
        frente.className = 'frente';
        frente.textContent = cardData.frente;
        const verso = document.createElement('div');
        verso.className = 'verso';
        verso.textContent = cardData.verso;
        cardDiv.appendChild(frente);
        cardDiv.appendChild(verso);
        flashContainer.appendChild(cardDiv);
      });
      section.appendChild(flashContainer);
    }
    // Botão de quiz do módulo
    const quizBtn = document.createElement('button');
    quizBtn.textContent = 'Fazer Quiz do Módulo';
    quizBtn.setAttribute('data-quiz', data.id);
    quizBtn.className = 'quiz-btn';
    section.appendChild(quizBtn);
    area.appendChild(section);
  });
}

// Renderiza a lista de referências científicas
function renderizarReferencias() {
  fetchData('referencias.json')
    .then((refs) => {
      const area = document.getElementById('area-conteudo');
      area.innerHTML = '';
      const list = document.createElement('ul');
      refs.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item.referencia;
        list.appendChild(li);
      });
      area.appendChild(list);
    })
    .catch((error) => console.error(error));
}

// Renderiza o quiz para um módulo específico
function renderizarQuiz(moduloId) {
  const perguntas = bancoQuestoes.filter((q) => String(q.modulo) === String(moduloId));
  const container = document.getElementById('area-conteudo');
  container.innerHTML = '';
  perguntas.forEach((quest, index) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'questao';
    // Caso clínico
    const pCaso = document.createElement('p');
    pCaso.innerHTML = '<strong>Caso clínico:</strong> ' + quest.caso_clinico;
    qDiv.appendChild(pCaso);
    // Enunciado
    const pComando = document.createElement('p');
    pComando.innerHTML = '<strong>' + (index + 1) + '. </strong>' + quest.comando;
    qDiv.appendChild(pComando);
    // Alternativas
    const altDiv = document.createElement('div');
    altDiv.className = 'alternativas';
    Object.entries(quest.alternativas).forEach(([letra, texto]) => {
      const label = document.createElement('label');
      label.className = 'alternativa';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'questao_' + quest.id;
      input.value = letra;
      input.dataset.correto = quest.resposta_correta;
      label.appendChild(input);
      const span = document.createElement('span');
      span.innerHTML = letra + ') ' + texto;
      label.appendChild(span);
      altDiv.appendChild(label);
    });
    qDiv.appendChild(altDiv);
    // Feedback
    const feedback = document.createElement('div');
    feedback.className = 'feedback hidden';
    feedback.textContent = quest.feedback;
    qDiv.appendChild(feedback);
    container.appendChild(qDiv);
  });
  // Listener para correção do quiz
  container.addEventListener('change', function handleQuiz(event) {
    const target = event.target;
    if (target.tagName === 'INPUT' && target.type === 'radio') {
      const correto = target.dataset.correto;
      const questaoDiv = target.closest('.questao');
      const labels = questaoDiv.querySelectorAll('label.alternativa');
      labels.forEach((lbl) => {
        const input = lbl.querySelector('input');
        if (input.value === correto) {
          lbl.classList.add('correta');
        } else {
          lbl.classList.add('incorreta');
        }
        input.disabled = true;
      });
      const fb = questaoDiv.querySelector('.feedback');
      fb.classList.remove('hidden');
    }
  }, { once: false });
}

// Gera a prova simulada com base nos módulos selecionados
function gerarProvaSimulada() {
  // Obtém os módulos selecionados
  const selecionados = Array.from(document.querySelectorAll('#form-prova input[type="checkbox"]:checked'))
    .map((cb) => parseInt(cb.value));
  if (selecionados.length === 0) {
    alert('Selecione pelo menos um módulo para gerar a prova.');
    return;
  }
  // Filtra questões
  let questõesFiltradas = bancoQuestoes.filter((q) => selecionados.includes(q.modulo));
  // Embaralha e seleciona as 10 primeiras
  questõesFiltradas = questõesFiltradas.sort(() => Math.random() - 0.5).slice(0, 10);
  renderizarProva(questõesFiltradas);
  // Fechar modal
  document.getElementById('modal-prova').classList.add('hidden');
}

// Renderiza a prova simulada
function renderizarProva(questoes) {
  const container = document.getElementById('prova-container');
  container.innerHTML = '';
  questoes.forEach((quest, index) => {
    const div = document.createElement('div');
    div.className = 'questao-prova';
    // Caso clínico
    const pCaso = document.createElement('p');
    pCaso.innerHTML = '<strong>Caso clínico:</strong> ' + quest.caso_clinico;
    div.appendChild(pCaso);
    // Comando
    const pComando = document.createElement('p');
    pComando.innerHTML = '<strong>' + (index + 1) + '. </strong>' + quest.comando;
    div.appendChild(pComando);
    // Alternativas
    const altDiv = document.createElement('div');
    altDiv.className = 'alternativas';
    Object.entries(quest.alternativas).forEach(([letra, texto]) => {
      const label = document.createElement('label');
      label.className = 'alternativa';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'prova_' + index;
      input.value = letra;
      input.dataset.correto = quest.resposta_correta;
      label.appendChild(input);
      const span = document.createElement('span');
      span.innerHTML = letra + ') ' + texto;
      label.appendChild(span);
      altDiv.appendChild(label);
    });
    div.appendChild(altDiv);
    // Feedback
    const feedback = document.createElement('div');
    feedback.className = 'feedback hidden';
    feedback.textContent = quest.feedback;
    div.appendChild(feedback);
    container.appendChild(div);
  });
  container.classList.remove('hidden');
  // Listener para correção da prova
  container.addEventListener('change', function handleProva(event) {
    const alvo = event.target;
    if (alvo.tagName === 'INPUT') {
      const correto = alvo.dataset.correto;
      const blocoQuestao = alvo.closest('.questao-prova');
      blocoQuestao.querySelectorAll('label.alternativa').forEach((lbl) => {
        const input = lbl.querySelector('input');
        if (input.value === correto) {
          lbl.classList.add('correta');
        } else {
          lbl.classList.add('incorreta');
        }
        input.disabled = true;
      });
      blocoQuestao.querySelector('.feedback').classList.remove('hidden');
    }
  }, { once: false });
}