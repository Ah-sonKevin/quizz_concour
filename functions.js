// functions.js

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function loadCoursesFromSupabase() {
    const { data: courses, error } = await supabase.from('courses').select('*');
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

        course.subsections.forEach(subsection => {
            const subsectionElement = document.createElement('p');
            subsectionElement.textContent = subsection;
            courseDiv.appendChild(subsectionElement);
        });

        coursesSection.appendChild(courseDiv);
    });
}

function navigateToQuiz() {
    window.location.href = 'quiz.html';
}
