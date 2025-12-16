let currentMode = 'textToImage';
let formulas = {};
let currentQuestion = null;
let currentAnswers = [];
let correctAnswerIndex = null;
let selectedAnswerIndex = null;
let score = 0;
let totalQuestions = 0;
let isAnswered = false;
let usedQuestions = [];

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

async function loadFormulasData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные формул');
        }
        const data = await response.json();
        formulas = data.formulas;
        console.log('Данные формул загружены:', formulas);
        init();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        formulas = {
            "img/form1.png": "Изобарный процесс",
            "img/form2.png": "Адиабатический процесс",
            "img/form3.png": "Уравнение Клапейрона-Менделеева",
            "img/form4.png": "Первый закон термодинамики",
            "img/form5.png": "Закон Ома для полной цепи",
            "img/form6.png": "Второй закон Ньютона",
            "img/form7.png": "Закон Кулона",
            "img/form8.png": "Формула Эйнштейна"
        };
        init();
    }
}

function init() {
    updateStats();
    loadNewQuestion();
    setupEventListeners();
}

function setupEventListeners() {
    toggleModeBtn.addEventListener('click', toggleMode);
    resetBtn.addEventListener('click', resetGame);
    nextBtn.addEventListener('click', loadNewQuestion);
    
    answerOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (!isAnswered) {
                selectAnswer(parseInt(option.dataset.index));
            }
        });
    });
}

function toggleMode() {
    if (currentMode === 'textToImage') {
        currentMode = 'imageToText';
        toggleModeBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Режим: Формула → Название';
    } else {
        currentMode = 'textToImage';
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
    loadNewQuestion();
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    nextBtn.disabled = true;
}

function loadNewQuestion() {
    resetAnswerOptions();
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    nextBtn.disabled = true;
    selectedAnswerIndex = null;
    isAnswered = false;
    
    if (Object.keys(formulas).length === 0) {
        questionElement.innerHTML = '<p style="color: red;">Данные формул не загружены. Проверьте файл data.json</p>';
        return;
    }
    
    let availableQuestions;
    
    if (currentMode === 'textToImage') {
        availableQuestions = Object.values(formulas).filter(value => !usedQuestions.includes(value));
    } else {
        availableQuestions = Object.keys(formulas).filter(key => !usedQuestions.includes(key));
    }
    
    if (availableQuestions.length === 0) {
        usedQuestions = [];
        availableQuestions = currentMode === 'textToImage' ? Object.values(formulas) : Object.keys(formulas);
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
    
    if (currentMode === 'textToImage') {
        const imagePath = Object.keys(formulas).find(key => formulas[key] === currentQuestion);
        
        currentAnswers.push(imagePath);
        
        const allImagePaths = Object.keys(formulas).filter(path => path !== imagePath);
        const shuffledPaths = shuffleArray([...allImagePaths]);
        
        for (let i = 0; i < 3 && i < shuffledPaths.length; i++) {
            currentAnswers.push(shuffledPaths[i]);
        }
        
        correctAnswerIndex = 0;
    } else {
        const correctAnswer = formulas[currentQuestion];
        currentAnswers.push(correctAnswer);
        
        const allAnswers = Object.values(formulas).filter(answer => answer !== correctAnswer);
        const shuffledAnswers = shuffleArray([...allAnswers]);
        
        for (let i = 0; i < 3 && i < shuffledAnswers.length; i++) {
            currentAnswers.push(shuffledAnswers[i]);
        }
        
        correctAnswerIndex = 0;
    }
    
    const correctAnswer = currentAnswers[correctAnswerIndex];
    currentAnswers = shuffleArray(currentAnswers);
    correctAnswerIndex = currentAnswers.indexOf(correctAnswer);
}

function displayQuestion() {
    if (currentMode === 'textToImage') {
        questionElement.textContent = currentQuestion;
    } else {
        const img = document.createElement('img');
        img.src = currentQuestion;
        img.alt = "Формула";
        img.onerror = function() {
            this.onerror = null;
            this.src = 'https://via.placeholder.com/300x150/cccccc/333333?text=Изображение+не+найдено';
        };
        questionElement.innerHTML = '';
        questionElement.appendChild(img);
    }
}

function displayAnswers() {
    answerOptions.forEach((option, index) => {
        const answerContent = option.querySelector('.answer-content');
        answerContent.innerHTML = '';
        
        if (index < currentAnswers.length) {
            const answer = currentAnswers[index];
            
            if (currentMode === 'textToImage') {
                const img = document.createElement('img');
                img.src = answer;
                img.alt = "Вариант формулы";
                img.onerror = function() {
                    this.onerror = null;
                    this.src = 'https://via.placeholder.com/200x100/cccccc/333333?text=Изображение+не+найдено';
                };
                answerContent.appendChild(img);
            } else {
                answerContent.textContent = answer;
            }
            
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

function selectAnswer(index) {
    if (isAnswered) return;
    
    selectedAnswerIndex = index;
    
    answerOptions.forEach(option => option.classList.remove('selected'));
    answerOptions[index].classList.add('selected');
    
    isAnswered = true;
    const isCorrect = index === correctAnswerIndex;
    
    answerOptions.forEach((option, i) => {
        if (i === correctAnswerIndex) {
            option.classList.add('correct');
        } else if (i === index && !isCorrect) {
            option.classList.add('wrong');
        }
    });
    
    if (isCorrect) {
        score++;
        feedbackElement.textContent = "Правильно! ✓";
        feedbackElement.classList.add('correct');
    } else {
        let correctAnswerText;
        if (currentMode === 'textToImage') {
            const imgPath = currentAnswers[correctAnswerIndex];
            correctAnswerText = formulas[imgPath] || "Правильная формула";
        } else {
            correctAnswerText = currentAnswers[correctAnswerIndex];
        }
        feedbackElement.textContent = `Неправильно. Правильный ответ: ${correctAnswerText}`;
        feedbackElement.classList.add('wrong');
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
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

document.addEventListener('DOMContentLoaded', loadFormulasData);