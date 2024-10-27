
const supabaseUrl = 'https://YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function navigateToCourses() {
    window.location.href = 'courses.html';
}

// Load Courses
async function loadCourses() {
    const { data: courses, error } = await supabase.from('courses').select('*');
    if (error) {
        console.error('Error loading courses:', error);
        return;
    }
    const coursesList = document.getElementById('courses-list');
    courses.forEach(course => {
        const button = document.createElement('button');
        button.innerText = course.name;
        button.onclick = () => navigateToQuiz(course.id);
        coursesList.appendChild(button);
    });
}

// Navigate to Quiz Page
async function navigateToQuiz(courseId) {
    sessionStorage.setItem('selectedCourse', courseId);
    window.location.href = 'quiz.html';
}

// Load Quiz Questions
async function loadQuiz() {
    const courseId = sessionStorage.getItem('selectedCourse');
    const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('course_id', courseId);
    if (error) {
        console.error('Error loading questions:', error);
        return;
    }
    const quizContainer = document.getElementById('quiz-container');
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.innerHTML = `<h3>${index + 1}. ${question.text}</h3>`;
        question.options.forEach(option => {
            const optionLabel = document.createElement('label');
            optionLabel.innerHTML = `<input type="radio" name="question-${question.id}" value="${option}"> ${option}`;
            questionDiv.appendChild(optionLabel);
        });
        quizContainer.appendChild(questionDiv);
    });
}

// Submit Quiz
async function submitQuiz() {
    const courseId = sessionStorage.getItem('selectedCourse');
    const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('course_id', courseId);
    let score = 0;
    questions.forEach(question => {
        const selectedOption = document.querySelector(`input[name="question-${question.id}"]:checked`);
        if (selectedOption && selectedOption.value === question.correct_answer) {
            score++;
        }
    });
    alert(`Your score: ${score}/${questions.length}`);
    showExplanations(questions);
}

// Show Explanations
function showExplanations(questions) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';
    questions.forEach((question, index) => {
        const explanationDiv = document.createElement('div');
        explanationDiv.classList.add('explanation');
        explanationDiv.innerHTML = `<h3>${index + 1}. ${question.text}</h3>
                                    <p>Correct Answer: ${question.correct_answer}</p>
                                    <p>Explanation: ${question.explanation}</p>`;
        quizContainer.appendChild(explanationDiv);
    });
}

// Event Listeners
if (window.location.pathname.endsWith('courses.html')) {
    window.onload = loadCourses;
}
if (window.location.pathname.endsWith('quiz.html')) {
    window.onload = loadQuiz;
}
