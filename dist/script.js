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
let step = 0;

function paintStep() {
  questions.forEach((question, index) => question.classList.toggle('active', index === step));
  const percent = Math.round(((step + 1) / questions.length) * 100);
  progressBar.style.width = `${percent}%`;
  progressPct.textContent = `${percent}%`;
  stepLabel.textContent = `Pregunta ${step + 1}`;
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

const favorite = form.elements.favorite;
favorite.addEventListener('input', () => document.querySelector('#charCount').textContent = favorite.value.length);

function paintInterest() {
  const value = Number(interestRange.value);
  const face = value < 25 ? '🙂' : value < 50 ? '😊' : value < 75 ? '😍' : '🤯';
  const message = value < 25 ? 'Interés estable: todavía estamos reuniendo pistas.' : value < 50 ? 'Hay curiosidad… el detective toma nota.' : value < 75 ? '¡Subió bastante! Aquí hay material para una secuela.' : '¡Caso resuelto! El sospechoso parece gustarte mucho.';
  document.querySelector('#interestValue').textContent = value;
  document.querySelector('#interestFace').textContent = face;
  document.querySelector('#interestMessage').textContent = message;
  interestRange.style.background = `linear-gradient(to right, var(--pink) 0 ${value}%, #eee ${value}%)`;
}
interestRange.addEventListener('input', paintInterest);

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!currentIsValid()) return;
  const data = new FormData(form);
  const verdict = data.get('second');
  const endings = {
    yes: ['💘', '¡Auditoría aprobada con honores!', 'El Departamento de Segundas Citas celebra este resultado. Procederemos a planear el siguiente capítulo con entusiasmo sospechosamente alto.'],
    maybe: ['👀', 'La trama se pone interesante…', 'Resultado prometedor. Se recomienda una segunda muestra para obtener conclusiones científicamente románticas.'],
    friends: ['🤝', 'Honestidad: 10 de 10', 'Gracias por responder con claridad y buena onda. Una gran conversación también puede ser el comienzo de una bonita amistad.']
  };
  const [emoji, title, text] = endings[verdict];
  document.querySelector('#resultEmoji').textContent = emoji;
  document.querySelector('#resultTitle').textContent = title;
  document.querySelector('#resultText').textContent = text;
  document.querySelector('#resultStars').textContent = `${data.get('stars')}★`;
  document.querySelector('#resultInterest').textContent = `${data.get('interest')}%`;
  document.querySelector('#resultIdea').textContent = data.get('idea')?.trim() || 'Sorpresa del organizador/a ✨';
  surveyCard.style.display = 'none';
  resultCard.classList.add('show');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.querySelector('#restartBtn').addEventListener('click', () => {
  form.reset();
  step = 0;
  document.querySelector('#charCount').textContent = '0';
  paintInterest();
  resultCard.classList.remove('show');
  surveyCard.style.display = 'block';
  paintStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

paintStep();
paintInterest();
