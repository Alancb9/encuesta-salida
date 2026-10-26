const form = document.querySelector('#dateSurvey');
const questions = [...document.querySelectorAll('.question')];
const progressBar = document.querySelector('#progressBar');
const progressPct = document.querySelector('#progressPct');
const stepLabel = document.querySelector('#stepLabel');
const backBtn = document.querySelector('#backBtn');
const nextBtn = document.querySelector('#nextBtn');
const submitBtn = document.querySelector('#submitBtn');
const formError = document.querySelector('#formError');
const surveyCard = document.querySelector('#surveyCard');
const resultCard = document.querySelector('#resultCard');
const interestRange = document.querySelector('#interestRange');
const totalSteps = document.querySelector('#totalSteps');
const startSurveyBtn = document.querySelector('#startSurvey');
const backgroundMusic = document.querySelector('#backgroundMusic');
const musicToggle = document.querySelector('#musicToggle');
let step = 0;

totalSteps.textContent = questions.length;

backgroundMusic.volume = 0.35;

function paintMusicState(isPlaying) {
  musicToggle.classList.toggle('playing', isPlaying);
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.setAttribute('aria-label', isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo');
  musicToggle.textContent = isPlaying ? '♫ Música: sonando' : '♫ Música: pausada';
}

function playMusic() {
  const playAttempt = backgroundMusic.play();
  if (playAttempt) {
    playAttempt.then(() => paintMusicState(true)).catch(() => {
      paintMusicState(false);
      musicToggle.textContent = '♫ Música: reproducir';
    });
  }
}

startSurveyBtn.addEventListener('click', () => {
  playMusic();
  document.body.classList.add('survey-started');
  surveyCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

musicToggle.addEventListener('click', () => {
  if (backgroundMusic.paused) {
    playMusic();
  } else {
    backgroundMusic.pause();
    paintMusicState(false);
  }
});

backgroundMusic.addEventListener('pause', () => paintMusicState(false));
backgroundMusic.addEventListener('play', () => paintMusicState(true));

function paintStep() {
  questions.forEach((question, index) => question.classList.toggle('active', index === step));
  const percent = Math.round(((step + 1) / questions.length) * 100);
  progressBar.style.width = `${percent}%`;
  progressPct.textContent = `${percent}%`;
  stepLabel.textContent = `Nivel ${step + 1}`;
  backBtn.style.visibility = step ? 'visible' : 'hidden';
  nextBtn.style.display = step === questions.length - 1 ? 'none' : 'block';
  submitBtn.style.display = step === questions.length - 1 ? 'block' : 'none';
  formError.textContent = '';
}

function currentIsValid() {
  const required = [...questions[step].querySelectorAll('[required]')];
  const invalid = required.find(input => !input.checkValidity());
  if (invalid) {
    formError.textContent = '👀 Falta esta respuesta para continuar.';
    invalid.focus();
    return false;
  }
  return true;
}

nextBtn.addEventListener('click', () => {
  if (!currentIsValid()) return;
  step += 1;
  paintStep();
  surveyCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

backBtn.addEventListener('click', () => {
  step = Math.max(0, step - 1);
  paintStep();
});

form.addEventListener('change', event => {
  if (event.target.matches('input[type="radio"]')) formError.textContent = '';
});

const textCounters = [
  [form.elements.opinion, '#opinionCount'],
  [form.elements.questionRound, '#questionRoundCount'],
  [form.elements.apologyReply, '#apologyReplyCount']
];
textCounters.forEach(([field, counter]) => {
  field.addEventListener('input', () => {
    document.querySelector(counter).textContent = field.value.length;
    formError.textContent = '';
  });
});

function paintInterest() {
  const value = Number(interestRange.value);
  const face = value < 25 ? '🙂' : value < 50 ? '😊' : value < 75 ? '😍' : '🤯';
  const message = value < 25 ? 'Interés estable: todavía estamos reuniendo datos.' : value < 50 ? 'Hay curiosidad… esto se está poniendo interesante.' : value < 75 ? '¡Subió bastante! Aquí hay material para una secuela.' : '¡Nivel máximo! La puntuación habla por sí sola.';
  document.querySelector('#interestValue').textContent = value;
  document.querySelector('#interestFace').textContent = face;
  document.querySelector('#interestMessage').textContent = message;
  interestRange.style.background = `linear-gradient(to right, var(--pink) 0 ${value}%, #eee ${value}%)`;
}
interestRange.addEventListener('input', paintInterest);

function selectedAnswer(name) {
  const input = form.querySelector(`input[name="${name}"]:checked`);
  return input?.closest('label')?.querySelector('b')?.textContent.trim() || 'Sin respuesta';
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentIsValid()) return;
  const data = new FormData(form);
  if (/^\s*no\s+te\s+preocupes[.!\s]*$/i.test(data.get('apologyReply'))) {
    formError.textContent = '🚨 “No te preocupes” solamente no vale. ¡La presión social exige un poquito más! jajajaja';
    form.elements.apologyReply.focus();
    return;
  }
  const payload = {
    _subject: 'Respuestas de la encuesta de nuestra salida',
    _template: 'table',
    'Calificación general': `${data.get('stars')}/5 estrellas`,
    'Conversación': selectedAnswer('chat'),
    'Aumento de interés': `${data.get('interest')}%`,
    'Veredicto sobre mi risa': selectedAnswer('laugh'),
    'Cómo se sintió': selectedAnswer('comfort'),
    'Opinión sobre los palillos': selectedAnswer('chopsticks'),
    'Palabras para el chico': data.get('opinion').trim(),
    'Opinión sobre la ronda de preguntas': data.get('questionRound').trim(),
    'Mensaje después de la disculpa': data.get('apologyReply').trim()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando…';
  formError.textContent = '';

  try {
    const response = await fetch('https://formsubmit.co/ajax/kecabo1994@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || result.success === false || result.success === 'false') {
      throw new Error('No se pudo enviar');
    }
    surveyCard.style.display = 'none';
    resultCard.classList.add('show');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    formError.textContent = 'No se pudo enviar. Revisa la conexión e inténtalo de nuevo.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Enviar veredicto por correo <span>✉</span>';
  }
});

document.querySelector('#restartBtn').addEventListener('click', () => {
  form.reset();
  step = 0;
  textCounters.forEach(([, counter]) => {
    document.querySelector(counter).textContent = '0';
  });
  paintInterest();
  resultCard.classList.remove('show');
  surveyCard.style.display = 'block';
  document.body.classList.remove('survey-started');
  paintStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

paintStep();
paintInterest();
