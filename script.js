let currentMode = 'textToFormula'; // 'textToFormula' | 'formulaToText' | 'matching' | 'exam'
let formulas = {};
let currentQuestion = null;
let currentAnswers = [];
let correctAnswerIndex = null;
let selectedAnswerIndex = null;
let score = 0;
let totalQuestions = 0;
let isAnswered = false;
let usedQuestions = [];

let examItems = [];
const EXAM_QUESTIONS_COUNT = 15;

// DOM элементы
const toggleModeBtn = document.getElementById('toggleMode');
const resetBtn = document.getElementById('reset');
const nextBtn = document.getElementById('nextBtn');
const questionElement = document.getElementById('question');
const answerOptions = document.querySelectorAll('.answer-option');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const totalElement = document.getElementById('total');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressContainer = document.getElementById('progressContainer');

const cardContainer = document.querySelector('.card-container');
const matchingModeContainer = document.getElementById('matchingModeContainer');
const titlesCol = document.getElementById('titlesCol');
const formulasCol = document.getElementById('formulasCol');
const checkMatchingBtn = document.getElementById('checkMatchingBtn');

const examModeContainer = document.getElementById('examModeContainer');
const examQuestionsList = document.getElementById('examQuestionsList');
const checkExamBtn = document.getElementById('checkExamBtn');
const finishExamBtn = document.getElementById('finishExamBtn');
const examResult = document.getElementById('examResult');

const openGlossaryBtn = document.getElementById('openGlossaryBtn');
const closeGlossaryBtn = document.getElementById('closeGlossaryBtn');
const glossaryModal = document.getElementById('glossaryModal');
const glossaryList = document.getElementById('glossaryList');
const glossarySearch = document.getElementById('glossarySearch');

// Функция перерисовки формул через MathJax
function typesetMath() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
}

async function loadFormulasData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Не удалось загрузить data.json');
        const data = await response.json();
        formulas = data.formulas;
        init();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

function init() {
    updateStats();
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    toggleModeBtn.addEventListener('click', toggleMode);
    resetBtn.addEventListener('click', resetGame);
    nextBtn.addEventListener('click', loadNewQuestion);
    checkExamBtn.addEventListener('click', revealExamAnswers);
    finishExamBtn.addEventListener('click', calculateExamScore);

    openGlossaryBtn.addEventListener('click', openGlossary);
    closeGlossaryBtn.addEventListener('click', closeGlossary);
    glossarySearch.addEventListener('input', filterGlossary);

    glossaryModal.addEventListener('click', (e) => {
        if (e.target === glossaryModal) closeGlossary();
    });

    answerOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (!isAnswered) {
                selectAnswer(parseInt(option.dataset.index));
            }
        });
    });

    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function toggleMode() {
    if (currentMode === 'textToFormula') {
        currentMode = 'formulaToText';
        toggleModeBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Режим: Формула → Название';
    } else if (currentMode === 'formulaToText') {
        currentMode = 'matching';
        toggleModeBtn.innerHTML = '<i class="fas fa-th-large"></i> Режим: Пары (Соответствия)';
    } else if (currentMode === 'matching') {
        currentMode = 'exam';
        toggleModeBtn.innerHTML = '<i class="fas fa-graduation-cap"></i> Режим: Экзаменационный билет';
    } else {
        currentMode = 'textToFormula';
        toggleModeBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Режим: Название → Формула';
    }
    resetGame();
}

function resetGame() {
    score = 0;
    totalQuestions = 0;
    usedQuestions = [];
    isAnswered = false;
    updateStats();

    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    nextBtn.disabled = true;

    cardContainer.style.display = 'none';
    matchingModeContainer.style.display = 'none';
    examModeContainer.style.display = 'none';
    progressContainer.style.display = 'block';

    if (currentMode === 'matching') {
        matchingModeContainer.style.display = 'block';
        loadMatchingRound();
    } else if (currentMode === 'exam') {
        examModeContainer.style.display = 'block';
        progressContainer.style.display = 'none';
        loadExamTicket();
    } else {
        cardContainer.style.display = 'block';
        nextBtn.style.display = 'block';
        loadNewQuestion();
    }
}

/* ================= ЛОГИКА ОДИНОЧНЫХ КАРТОЧЕК ================= */

function loadNewQuestion() {
    resetAnswerOptions();
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    nextBtn.disabled = true;
    selectedAnswerIndex = null;
    isAnswered = false;

    if (Object.keys(formulas).length === 0) return;

    // ВАЖНО: в режиме textToFormula вопрос — это НАЗВАНИЕ (ключ).
    // В режиме formulaToText вопрос — это ФОРМУЛА (значение).
    let availableQuestions = (currentMode === 'textToFormula')
        ? Object.keys(formulas).filter(key => !usedQuestions.includes(key))
        : Object.values(formulas).filter(val => !usedQuestions.includes(val));

    if (availableQuestions.length === 0) {
        usedQuestions = [];
        availableQuestions = currentMode === 'textToFormula' 
            ? Object.keys(formulas) 
            : Object.values(formulas);
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randomIndex];
    usedQuestions.push(currentQuestion);

    generateAnswers();
    displayQuestion();
    displayAnswers();

    totalQuestions++;
    updateStats();
}

function generateAnswers() {
    currentAnswers = [];

    if (currentMode === 'textToFormula') {
        // Вопрос — название (ключ). Правильный ответ — формула (значение).
        const correctLatex = formulas[currentQuestion];
        currentAnswers.push(correctLatex);
        const all = Object.values(formulas).filter(v => v !== correctLatex);
        const shuffled = shuffleArray([...all]);
        for (let i = 0; i < 3 && i < shuffled.length; i++) currentAnswers.push(shuffled[i]);
    } else {
        // Вопрос — формула (значение). Правильный ответ — название (ключ).
        const correctTitle = Object.keys(formulas).find(k => formulas[k] === currentQuestion);
        currentAnswers.push(correctTitle);
        const all = Object.keys(formulas).filter(k => k !== correctTitle);
        const shuffled = shuffleArray([...all]);
        for (let i = 0; i < 3 && i < shuffled.length; i++) currentAnswers.push(shuffled[i]);
    }

    const correct = currentAnswers[0];
    currentAnswers = shuffleArray(currentAnswers);
    correctAnswerIndex = currentAnswers.indexOf(correct);
}

function displayQuestion() {
    if (currentMode === 'textToFormula') {
        // Показываем название
        questionElement.textContent = currentQuestion;
    } else {
        // Показываем формулу через MathJax
        questionElement.innerHTML = `$$${currentQuestion}$$`;
        typesetMath();
    }
}

function displayAnswers() {
    answerOptions.forEach((option, index) => {
        const answerContent = option.querySelector('.answer-content');
        answerContent.innerHTML = '';
        if (index < currentAnswers.length) {
            const answer = currentAnswers[index];
            if (currentMode === 'textToFormula') {
                // Ответ — формула через MathJax
                answerContent.innerHTML = `$$${answer}$$`;
            } else {
                // Ответ — название
                answerContent.textContent = answer;
            }
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
    typesetMath();
}

function selectAnswer(index) {
    if (isAnswered) return;
    selectedAnswerIndex = index;
    isAnswered = true;

    answerOptions.forEach(opt => opt.classList.remove('selected'));
    answerOptions[index].classList.add('selected');

    const isCorrect = index === correctAnswerIndex;
    answerOptions.forEach((opt, i) => {
        if (i === correctAnswerIndex) opt.classList.add('correct');
        else if (i === index && !isCorrect) opt.classList.add('wrong');
    });

    if (isCorrect) {
        score++;
        feedbackElement.textContent = "Правильно! ✓";
        feedbackElement.className = 'feedback correct';
    } else {
        const rightAnswer = currentAnswers[correctAnswerIndex];
        if (currentMode === 'textToFormula') {
            feedbackElement.innerHTML = `Неправильно. Правильный ответ: $${rightAnswer}$`;
            typesetMath();
        } else {
            feedbackElement.textContent = `Неправильно. Правильный ответ: ${rightAnswer}`;
        }
        feedbackElement.className = 'feedback wrong';
    }

    nextBtn.disabled = false;
    updateStats();
}

function resetAnswerOptions() {
    answerOptions.forEach(option => {
        option.classList.remove('selected', 'correct', 'wrong');
        option.style.display = 'flex';
    });
}

function updateStats() {
    scoreElement.textContent = score;
    totalElement.textContent = totalQuestions;
    const progress = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Прогресс: ${score}/${totalQuestions} (${Math.round(progress)}%)`;
}

function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

/* ================= ЛОГИКА СООТВЕТСТВИЙ (MATCHING) ================= */

function loadMatchingRound() {
    titlesCol.innerHTML = '';
    formulasCol.innerHTML = '';
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    checkMatchingBtn.disabled = false;

    const allKeys = Object.keys(formulas);
    const selectedKeys = shuffleArray(allKeys).slice(0, 4);
    const pairs = selectedKeys.map(key => ({ title: key, latex: formulas[key] }));

    const shuffledTitles = shuffleArray([...pairs]);
    const shuffledFormulas = shuffleArray([...pairs]);

    // Левая колонка: названия + пустые зоны
    shuffledTitles.forEach((pair, index) => {
        const row = document.createElement('div');
        row.className = 'match-row';
        row.dataset.correctTitle = pair.title;
        row.innerHTML = `
            <div class="match-label">${pair.title}</div>
            <div class="dropzone" data-row-index="${index}"></div>
        `;
        titlesCol.appendChild(row);
    });

    // Правая колонка: формулы для перетаскивания
    shuffledFormulas.forEach((pair, index) => {
        const zone = document.createElement('div');
        zone.className = 'dropzone storage-zone';
        zone.innerHTML = `
            <div class="drag-item" draggable="true" id="drag-${index}" data-title="${pair.title.replace(/"/g, '&quot;')}">
                <div class="formula-render">$$${pair.latex}$$</div>
            </div>
        `;
        formulasCol.appendChild(zone);
    });

    initDragAndDrop();
    
    // Даём MathJax время на рендер
    setTimeout(() => typesetMath(), 100);
}

function initDragAndDrop() {
    const dragItems = document.querySelectorAll('.drag-item');
    const dropzones = document.querySelectorAll('.dropzone');

    dragItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
            setTimeout(() => item.style.opacity = '0.5', 0);
        });
        item.addEventListener('dragend', () => item.style.opacity = '1');
    });

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text');
            const dragElement = document.getElementById(id);
            if (zone.children.length > 0 && !zone.classList.contains('storage-zone')) return;
            zone.appendChild(dragElement);
        });
    });
}

checkMatchingBtn.addEventListener('click', () => {
    const rows = document.querySelectorAll('.match-row');
    let correctCount = 0;
    let allPlaced = true;

    rows.forEach(row => {
        const placedItem = row.querySelector('.dropzone .drag-item');
        if (!placedItem) {
            allPlaced = false;
            row.classList.add('wrong-pair');
            return;
        }
        // Сравниваем по названию
        if (row.dataset.correctTitle === placedItem.dataset.title) {
            row.classList.remove('wrong-pair');
            row.classList.add('correct-pair');
            placedItem.draggable = false;
            correctCount++;
        } else {
            row.classList.remove('correct-pair');
            row.classList.add('wrong-pair');
        }
    });

    if (!allPlaced) {
        feedbackElement.textContent = "Заполните все ячейки перед проверкой!";
        feedbackElement.className = "feedback wrong";
        return;
    }

    totalQuestions += 4;
    score += correctCount;
    updateStats();

    if (correctCount === 4) {
        feedbackElement.textContent = "Великолепно! Все пары верны! 🎉";
        feedbackElement.className = "feedback correct";
        checkMatchingBtn.disabled = true;
        setTimeout(() => { if (currentMode === 'matching') loadMatchingRound(); }, 2500);
    } else {
        feedbackElement.textContent = `Угадано ${correctCount} из 4. Исправьте ошибки!`;
        feedbackElement.className = "feedback wrong";
    }
    
    // Перерисовываем формулы после всех изменений
    setTimeout(() => typesetMath(), 50);
});

/* ================= ЛОГИКА РЕЖИМА ЭКЗАМЕНА ================= */

function loadExamTicket() {
    examQuestionsList.innerHTML = '';
    examResult.style.display = 'none';
    examResult.innerHTML = '';
    checkExamBtn.style.display = 'block';
    finishExamBtn.style.display = 'none';

    const allKeys = Object.keys(formulas);
    const selectedKeys = shuffleArray(allKeys).slice(0, EXAM_QUESTIONS_COUNT);

    examItems = selectedKeys.map(key => ({
        title: key,
        latex: formulas[key],
        userStatus: null
    }));

    examItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'exam-card';
        card.id = `exam-card-${index}`;

        card.innerHTML = `
            <div class="exam-card-title">
                <span class="badge">№ ${index + 1}</span>
                <span>${item.title}</span>
            </div>
            <input type="text" class="exam-card-input" placeholder="Ваш ответ (или пишите на листочке)...">
            
            <div class="exam-review-panel" id="review-panel-${index}">
                <div class="exam-formula-preview">
                    <span>Эталон:</span>
                    <div class="formula-render">$$${item.latex}$$</div>
                </div>
                <div class="exam-vote-btns">
                    <button class="vote-btn pass" onclick="markExamItem(${index}, true)">✓ Верно</button>
                    <button class="vote-btn fail" onclick="markExamItem(${index}, false)">✕ Ошибка</button>
                </div>
            </div>
        `;
        examQuestionsList.appendChild(card);
    });

    typesetMath();
}

function revealExamAnswers() {
    document.querySelectorAll('.exam-review-panel').forEach(panel => {
        panel.classList.add('visible');
    });
    document.querySelectorAll('.exam-card-input').forEach(input => {
        input.disabled = true;
    });
    checkExamBtn.style.display = 'none';
    finishExamBtn.style.display = 'block';
    typesetMath();
}

window.markExamItem = function (index, isCorrect) {
    examItems[index].userStatus = isCorrect ? 'correct' : 'wrong';
    const card = document.getElementById(`exam-card-${index}`);
    const passBtn = card.querySelector('.vote-btn.pass');
    const failBtn = card.querySelector('.vote-btn.fail');

    if (isCorrect) {
        card.classList.add('checked-correct');
        card.classList.remove('checked-wrong');
        passBtn.classList.add('active');
        failBtn.classList.remove('active');
    } else {
        card.classList.add('checked-wrong');
        card.classList.remove('checked-correct');
        failBtn.classList.add('active');
        passBtn.classList.remove('active');
    }
};

function calculateExamScore() {
    const unrated = examItems.filter(item => item.userStatus === null).length;
    if (unrated > 0) {
        if (!confirm(`Вы еще не оценили ${unrated} вопросов. Завершить и посчитать как неверные?`)) {
            return;
        }
    }

    const correctCount = examItems.filter(item => item.userStatus === 'correct').length;
    const total = examItems.length;
    const percentage = Math.round((correctCount / total) * 100);

    let mark = 'Отлично! Тема освоена 🎉';
    let color = '#28a745';
    if (percentage < 60) {
        mark = 'Нужно повторить формулы 📚';
        color = '#dc3545';
    } else if (percentage < 80) {
        mark = 'Хороший результат, но есть пробелы 👍';
        color = '#fd7e14';
    }

    examResult.style.display = 'block';
    examResult.innerHTML = `
        <div style="font-size: 24px; color: ${color}; margin-bottom: 8px;">${mark}</div>
        <div>Результат: <strong>${correctCount} из ${total}</strong> (${percentage}%)</div>
    `;

    score = correctCount;
    totalQuestions = total;
    scoreElement.textContent = score;
    totalElement.textContent = totalQuestions;

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', loadFormulasData);

/* ================= ЛОГИКА СПРАВОЧНИКА ================= */

function openGlossary() {
    glossaryModal.style.display = 'flex';
    glossarySearch.value = '';
    renderGlossary();
    glossarySearch.focus();
}

function closeGlossary() {
    glossaryModal.style.display = 'none';
}

function renderGlossary(filterText = '') {
    glossaryList.innerHTML = '';
    const query = filterText.trim().toLowerCase();

    const items = Object.entries(formulas); // [ [title, latex], ... ]

    const filtered = items.filter(([title]) =>
        title.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        glossaryList.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#888; padding:20px;">Ничего не найдено</div>';
        return;
    }

    filtered.forEach(([title, latex]) => {
        const card = document.createElement('div');
        card.className = 'glossary-card';
        card.innerHTML = `
            <div class="glossary-card-title">${title}</div>
            <div class="glossary-card-img-wrap">
                <div class="formula-render">$$${latex}$$</div>
            </div>
        `;
        glossaryList.appendChild(card);
    });

    typesetMath();
}

function filterGlossary(e) {
    renderGlossary(e.target.value);
}

function handleKeyboardShortcuts(e) {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea') {
        if (e.key === 'Escape' && glossaryModal.style.display !== 'none') {
            closeGlossary();
        }
        return;
    }

    if (e.code === 'KeyG') {
        e.preventDefault();
        if (glossaryModal.style.display === 'none' || !glossaryModal.style.display) {
            openGlossary();
        } else {
            closeGlossary();
        }
        return;
    }

    if (e.key === 'Escape' && glossaryModal.style.display !== 'none') {
        closeGlossary();
        return;
    }

    if (currentMode === 'textToFormula' || currentMode === 'formulaToText') {
        const keyMap = {
            'Digit1': 0, 'Numpad1': 0,
            'Digit2': 1, 'Numpad2': 1,
            'Digit3': 2, 'Numpad3': 2,
            'Digit4': 3, 'Numpad4': 3
        };

        if (e.code in keyMap) {
            const index = keyMap[e.code];
            if (!isAnswered && index < currentAnswers.length) {
                selectAnswer(index);
            }
            return;
        }

        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') {
            if (isAnswered && !nextBtn.disabled) {
                e.preventDefault();
                loadNewQuestion();
            }
        }
    }
}