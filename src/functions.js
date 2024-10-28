// functions.js

import { supabasePromise } from '../supabase-config.js';
import { marked } from 'marked';


async function loadCategoriesFromSupabase() {
    try {
        const supabase = await supabasePromise;
        const { data: categories, error } = await supabase.from('categories').select('*');
        if (error) {
            console.error('Error loading categories:', error);
            return;
        }
        const categoriesSection = document.getElementById('categories-section');

        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
            categoryDiv.textContent = category.name;
            categoryDiv.onclick = () => {
                window.location.href = `courses.html?category_id=${category.id}`;
            };

            categoriesSection.appendChild(categoryDiv);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

export { loadCategoriesFromSupabase };

export async function loadCoursesFromSupabase() {
    try {
        const supabase = await supabasePromise;
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category_id');
        if (!categoryId) {
            console.error('No category ID provided');
            return;
        }

        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .eq('category_id', categoryId);  // Changed from category_id to name_category_id
        
        if (error) {
            console.error('Error loading courses:', error);
            return;
        }

        const coursesSection = document.getElementById('courses-section');

        courses.forEach(course => {
            const courseDiv = document.createElement('div');
            courseDiv.classList.add('course');

            const courseTitle = document.createElement('h3');
            courseTitle.textContent = course.name;
            courseDiv.appendChild(courseTitle);

            const courseDescription = document.createElement('p');
            courseDescription.textContent = course.description;
            courseDiv.appendChild(courseDescription);

            // You might want to add a "View Content" button
            const viewButton = document.createElement('button');
            viewButton.textContent = 'Voir le cours';
            viewButton.onclick = () => {
                window.location.href = `course-detail.html?course_id=${course.id}`;
            };
            courseDiv.appendChild(viewButton);

            coursesSection.appendChild(courseDiv);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function loadCourseDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    
    if (!courseId) {
        console.error('No course ID provided');
        return;
    }
    const supabase = await supabasePromise;
    const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
    
    if (error) {
        console.error('Error loading course:', error);
        return;
    }

    const courseDetailDiv = document.getElementById('course-detail');
    
    // Create HTML structure for course details
    const courseHTML = `
        <h1>${course.name}</h1>
        <div class="course-description">${course.description}</div>
        <div class="course-content">
            ${marked.parse(course.content || '')}
        </div>
    `;
    
    // Insert the HTML content
    courseDetailDiv.innerHTML = courseHTML;

    // Add event listener for the question button
    document.getElementById('ask-question').addEventListener('click', async () => {
        const question = document.getElementById('user-question').value;
        const responseDiv = document.getElementById('gpt-response');
        
        if (!question.trim()) {
            alert('Veuillez entrer une question');
            return;
        }

        responseDiv.innerHTML = 'Chargement de la réponse...';
        
        try {
            // Get the current session
            const { data: { session } } = await supabase.auth.getSession();
            
            // Create the payload
            const payload = {
                question: question,
                context: course?.content
            };
            
            // Log what we're sending
            console.log('Sending payload:', payload);

            // Make the request with the current session token
            const response = await fetch(
                'https://jktzfzbmpmgnwcysodsg.supabase.co/functions/v1/ask-gpt',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            // Get the response as text first
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error('Invalid response format from server');
            }

            // Check if it's an error response
            if (!response.ok) {
                console.error('Error response:', data);
                throw new Error(data.error || 'Unknown error occurred');
            }

            // Handle success response
            if (data.response) {
                responseDiv.innerHTML = marked.parse(data.response);
            } else {
                console.error('Unexpected response format:', data);
                throw new Error('Unexpected response format from server');
            }

        } catch (error) {
            console.error('Full error:', error);
            responseDiv.innerHTML = `
                <div class="error-message">
                    <p>Désolé, une erreur est survenue lors de la génération de la réponse.</p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
        }
    });
}

export async function loadQuiz() {
    try {
        const supabase = await supabasePromise;
        
        const { data: questions, error } = await supabase
            .rpc('get_random_questions', { limit_num: 20 });
        
        if (error) {
            console.error('Error loading questions:', error);
            return;
        }
        
        // Récupérer tous les course_ids uniques
        const courseIds = [...new Set(questions.map(q => q.course_id))];
        
        // Récupérer les informations des cours
        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds);

        if (coursesError) {
            console.error('Error loading courses:', coursesError);
            return;
        }

        // Créer un map des cours pour un accès rapide
        const coursesMap = Object.fromEntries(courses.map(course => [course.id, course]));

        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = '';

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question');
            
            // Modifier les informations du cours pour n'afficher que le nom
            const courseInfo = document.createElement('div');
            courseInfo.className = 'course-info';
            const course = coursesMap[question.course_id];

            
            // Create the question text
            const questionText = document.createElement('p');
            questionText.className = 'question-text';
            questionText.textContent = `${index + 1}. ${question.question}`;
            
            // Create options container
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            
            // Create checkboxes for each option
            question.choices.forEach((option, optionIndex) => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = `q${index}`;
                checkbox.value = optionIndex;
                
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${option}`));
                optionsDiv.appendChild(label);
            });

            // Create feedback div
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'feedback';
            feedbackDiv.id = `feedback-${index}`;

            // Append all elements
            questionDiv.appendChild(courseInfo);
            questionDiv.appendChild(questionText);
            questionDiv.appendChild(optionsDiv);
            questionDiv.appendChild(feedbackDiv);
            quizContainer.appendChild(questionDiv);
        });

        // Show the submit button after quiz is loaded successfully
        document.getElementById('submit-quiz').style.display = 'block';
        
        window.quizQuestions = questions;
    } catch (error) {
        console.error('Error in loadQuiz:', error);
    }
}

export async function submitQuiz() {
    const questions = window.quizQuestions;
    if (!questions) {
        alert('Please load the quiz first!');
        return;
    }

    let score = 0;
    // Utiliser Promise.all pour attendre toutes les vérifications
    await Promise.all(questions.map(async (question, index) => {
        const selectedAnswers = Array.from(
            document.querySelectorAll(`input[name="q${index}"]:checked`)
        ).map(input => question.choices[parseInt(input.value)]);

        const feedbackDiv = document.getElementById(`feedback-${index}`);
        
        const sortedSelected = selectedAnswers.sort();
        const sortedCorrect = question.reponses.sort();
        
        const isCorrect = 
            sortedSelected.length === sortedCorrect.length &&
            sortedSelected.every((value, index) => value === sortedCorrect[index]);

        // Si la réponse est correcte, incrémenter le score
        if (isCorrect) score++;

        // Récupérer les informations du cours
        const supabase = await supabasePromise;
        const { data: course, error } = await supabase
            .from('courses')
            .select('name, description')
            .eq('id', question.course_id)
            .single();

        if (error) {
            console.error('Error loading course:', error);
            return;
        }

        // Update the feedback message to include the explanation
        let feedbackMessage = isCorrect 
            ? '✅ Correct!' 
            : `❌ Incorrect.<br> : ${question.reponses.join(', ')}`;

        // Add explanation to feedback
        feedbackMessage += `<div class="explanation">
            <p><strong>Explication:</strong> ${question.explanation}</p>
        </div>`;

        // Ajouter le lien vers le cours seulement après la soumission
        feedbackDiv.innerHTML = `
            ${feedbackMessage}
            <div class="course-feedback">
                <h4>Cours associé : ${course.name}</h4>
                <p>${course.description}</p>
                <a href="course-detail.html?course_id=${question.course_id}" class="course-link">
                    Cliquez ici pour en savoir plus sur ce sujet
                </a>
            </div>
        `;
        feedbackDiv.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    }));

    const finalScore = (score / questions.length) * 100;
    
    let scoreDisplay = document.getElementById('quiz-score');
    if (!scoreDisplay) {
        scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'quiz-score';
        document.getElementById('quiz-container').appendChild(scoreDisplay);
    }
    scoreDisplay.className = 'quiz-score';
    scoreDisplay.textContent = `Your score: ${finalScore}% (${score}/${questions.length} correct)`;
}
