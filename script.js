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


const cardContainer = document.querySelector('.card-container');
const matchingModeContainer = document.getElementById('matchingModeContainer');
const titlesCol = document.getElementById('titlesCol');
const formulasCol = document.getElementById('formulasCol');
const checkMatchingBtn = document.getElementById('checkMatchingBtn');

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
                "img/form1.png": "Закон Кулона",
                "img/form2.png": "Напряженность поля точечного заряда",
                "img/form3.png": "Потенциал поля точечного заряда",
                "img/form4.png": "Дипольный момент",
                "img/form5.png": "Напряженность поля диполя. На продолжении оси диполя",
                "img/form6.png": "Потенциал поля диполя",
                "img/form7.png": "Момент сил, действующих на диполь",
                "img/form8.png": "Потенциальная энергия диполя",
                "img/form9.png": "Напряженность поля бесконечной плоскости",
                "img/form10.png": "Потенциал поля бесконечной плоскости",
                "img/form11.png": "Напряженность поля заряженной нити",
                "img/form12.png": "Потенциал поля заряженной нити",
                "img/form13.png": "Напряженность поля на оси заряженного кольца",
                "img/form14.png": "Потенциал поля на оси заряженного кольца",
                "img/form15.png": "Напряженность поля проводящей сферы. Внутри сферы",
                "img/form16.png": "Потенциал поля проводящей сферы. Внутри сферы",
                "img/form17.png": "Емкость проводящей сферы",
                "img/form18.png": "Энергия заряженной сферы",
                "img/form19.png": "Напряженность поля равномерно заряженного шара. Внутри шара",
                "img/form20.png": "Потенциал поля равномерно заряженного шара. Внутри шара",
                "img/form21.png": "Емкость плоского конденсатора",
                "img/form22.png": "Емкость сферического конденсатора",
                "img/form23.png": "Емкость цилиндрического конденсатора",
                "img/form24.png": "Параллельное соединение конденсаторов",
                "img/form25.png": "Последовательное соединение конденсаторов",
                "img/form26.png": "Связь напряженности и потенциала",
                "img/form27.png": "Интегральная связь поля и потенциала",
                "img/form28.png": "Теорема Гаусса в интегральной форме",
                "img/form29.png": "Вектор поляризации",
                "img/form30.png": "Связь напряженности и индукции электростатического поля",
                "img/form31.png": "Закон Ома в интегральной форме",
                "img/form32.png": "Закон Ома для участка цепи",
                "img/form33.png": "Сопротивление проводника",
                "img/form34.png": "Параллельное соединение резисторов",
                "img/form35.png": "Последовательное соединение резисторов",
                "img/form36.png": "Закон Джоуля-Ленца",
                "img/form37.png": "Мощность тока",
                "img/form38.png": "Дифференциальная форма закона Ома",
                "img/form39.png": "Первое правило Кирхгофа",
                "img/form40.png": "Второе правило Кирхгофа",
                "img/form41.png": "Закон Ома для замкнутой цепи",
                "img/form42.png": "Закон Био-Савара-Лапласа",
                "img/form43.png": "Поле бесконечного прямого провода",
                "img/form44.png": "Поле провода конечной длины",
                "img/form45.png": "Поле в центре кругового витка",
                "img/form46.png": "Поле соленоида (бесконечного или когда длина >> диаметра)",
                "img/form47.png": "Поле на оси соленоида длины l и радиуса R",
                "img/form48.png": "Поле тороида",
                "img/form49.png": "Поток магнитной индукции",
                "img/form50.png": "Теорема о циркуляции",
                "img/form51.png": "Сила Ампера",
                "img/form52.png": "Сила взаимодействия параллельных токов",
                "img/form53.png": "Сила Лоренца",
                "img/form54.png": "Момент сил на рамке",
                "img/form55.png": "Намагниченность",
                "img/form56.png": "Связь напряженности и индукции магнитного поля",
                "img/form57.png": "Закон Фарадея (электромагнитной индукции)",
                "img/form58.png": "Индуктивность соленоида",
                "img/form59.png": "Энергия катушки индуктивности",
                "img/form60.png": "Энергия магнитного поля. Объемная плотность энергии",
                "img/form61.png": "Ток при размыкании цепи",
                "img/form62.png": "Ток при замыкании цепи",
                "img/form63.png": "Циклическая частота колебательного контура",
                "img/form64.png": "Скорость электромагнитной волны",
                "img/form65.png": "Энергия магнитного поля. Полная энергия",
                "img/form66.png": "Напряженность поля диполя. На перпендикуляре к оси из его центра",
                "img/form67.png": "Напряженность поля проводящей сферы. Снаружи сферы",
                "img/form68.png": "Потенциал поля проводящей сферы. Снаружи сферы"
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
    } else if (currentMode === 'imageToText') {
        currentMode = 'matching';
        toggleModeBtn.innerHTML = '<i class="fas fa-th-large"></i> Режим: Пары (Соответствия)';
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
    
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    nextBtn.disabled = true;

    if (currentMode === 'matching') {
        cardContainer.style.display = 'none';
        nextBtn.style.display = 'none';
        matchingModeContainer.style.display = 'block';
        loadMatchingRound();
    } else {
        cardContainer.style.display = 'block';
        nextBtn.style.display = 'block';
        matchingModeContainer.style.display = 'none';
        loadNewQuestion();
    }
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


// ГЕНЕРАЦИЯ РЕЖИМА ПАР
function loadMatchingRound() {
    titlesCol.innerHTML = '';
    formulasCol.innerHTML = '';
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    checkMatchingBtn.disabled = false;

    // Берем 4 случайные формулы из пула загруженных данных
    const allKeys = Object.keys(formulas);
    const selectedKeys = shuffleArray(allKeys).slice(0, 4); 
    
    // Создаем массив объектов для работы
    const pairs = selectedKeys.map(key => ({ img: key, text: formulas[key] }));
    
    // Перемешиваем отдельно левую часть и правую часть
    const shuffledTitles = shuffleArray([...pairs]);
    const shuffledFormulas = shuffleArray([...pairs]);

    // Рендерим левую колонку (Ряды: Название + Пустая Дропзона)
    shuffledTitles.forEach((pair, index) => {
        const row = document.createElement('div');
        row.className = 'match-row';
        row.dataset.correctImg = pair.img; // запоминаем, какая картинка тут должна быть
        
        row.innerHTML = `
            <div class="match-label">${pair.text}</div>
            <div class="dropzone" data-row-index="${index}"></div>
        `;
        titlesCol.appendChild(row);
    });

    // Рендерим правую колонку (Изначальные контейнеры для перетаскиваемых картинок)
    shuffledFormulas.forEach((pair, index) => {
        const zone = document.createElement('div');
        zone.className = 'dropzone storage-zone';
        
        const dragItem = document.createElement('div');
        dragItem.className = 'drag-item';
        dragItem.draggable = true;
        dragItem.id = `drag-${index}`;
        dragItem.dataset.imgSrc = pair.img; // Храним путь к картинке

        const img = document.createElement('img');
        img.src = pair.img;
        img.alt = "Формула";
        
        dragItem.appendChild(img);
        zone.appendChild(dragItem);
        formulasCol.appendChild(zone);
    });

    initDragAndDrop();
}

// ЛОГИКА DRAG AND DROP API
function initDragAndDrop() {
    const dragItems = document.querySelectorAll('.drag-item');
    const dropzones = document.querySelectorAll('.dropzone');

    dragItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
            setTimeout(() => item.style.opacity = '0.5', 0);
        });

        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });
    });

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Разрешаем сброс
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            const id = e.dataTransfer.getData('text');
            const dragElement = document.getElementById(id);
            
            // Если в зоне уже есть элемент, возвращаем его обратно в свободную ячейку справа
            if (zone.children.length > 0 && !zone.classList.contains('storage-zone')) {
                return; // Или можно написать логику рокировки
            }
            
            zone.appendChild(dragElement);
        });
    });
}

// ПРОВЕРКА РЕЗУЛЬТАТОВ РАУНДА MATCHING
checkMatchingBtn.onclick = null;
checkMatchingBtn.addEventListener('click', () => {
    const rows = document.querySelectorAll('.match-row');
    let correctCount = 0;
    let allPlaced = true;

    rows.forEach(row => {
        const dropzone = row.querySelector('.dropzone');
        const placedItem = dropzone.querySelector('.drag-item');
        
        if (!placedItem) {
            allPlaced = false;
            row.classList.add('wrong-pair');
            return;
        }

        const expectedImg = row.dataset.correctImg;
        const actualImg = placedItem.dataset.imgSrc;

        if (expectedImg === actualImg) {
            row.classList.remove('wrong-pair');
            row.classList.add('correct-pair');
            // Запрещаем перетаскивать угаданное
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
        feedbackElement.textContent = "Великолепно! Все пары подобраны верно! 🎉";
        feedbackElement.className = "feedback correct";
        checkMatchingBtn.disabled = true;
        
        // Через 3 секунды автоматически загружаем новые пары
        setTimeout(() => {
            if (currentMode === 'matching') loadMatchingRound();
        }, 3000);
    } else {
        feedbackElement.textContent = `Вы угадали ${correctCount} из 4 пар. Исправьте ошибки!`;
        feedbackElement.className = "feedback wrong";
    }
});


document.addEventListener('DOMContentLoaded', loadFormulasData);
