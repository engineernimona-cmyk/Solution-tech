// ==================== APP STATE ====================
const appState = {
  user: null,
  token: localStorage.getItem('token'),
  progress: {}
};

// ==================== API HELPERS ====================
async function apiRequest(endpoint, options = {}) {
  const url = '/api' + endpoint;
  const headers = { 'Content-Type': 'application/json' };
  if (appState.token) {
    headers['Authorization'] = `Bearer ${appState.token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    logout();
    router.navigate('/login');
    return null;
  }
  return res.json();
}

// ==================== AUTH ====================
async function login(email, password) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (data?.token) {
    appState.token = data.token;
    appState.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    updateNav();
    router.navigate('/dashboard');
  } else {
    alert(data?.error || 'Login failed');
  }
}

async function register(name, email, password) {
  const data = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  if (data?.token) {
    appState.token = data.token;
    appState.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    updateNav();
    router.navigate('/dashboard');
  } else {
    alert(data?.error || 'Registration failed');
  }
}

function logout() {
  appState.token = null;
  appState.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateNav();
  router.navigate('/');
}

function updateNav() {
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const logoutLink = document.getElementById('logoutLink');
  if (appState.user) {
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
    logoutLink.style.display = 'inline-block';
  } else {
    loginLink.style.display = 'inline-block';
    registerLink.style.display = 'inline-block';
    logoutLink.style.display = 'none';
  }
}

// ==================== ROUTER ====================
const router = {
  routes: {},
  addRoute(path, handler) {
    this.routes[path] = handler;
  },
  navigate(path) {
    window.location.hash = path;
    this.handlePath(path);
  },
  handlePath(path) {
    const handler = this.routes[path] || this.routes['/404'];
    if (handler) handler();
    else console.error('No handler for', path);
  },
  init() {
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1) || '/';
      this.handlePath(path);
    });
    const path = window.location.hash.slice(1) || '/';
    this.handlePath(path);
  }
};

// ==================== PAGE RENDERERS ====================
function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h1>Master Programming Step by Step</h1>
        <p>Learn HTML, CSS, JavaScript, Python, Java, C#, C++ with interactive tutorials, real-time coding, quizzes and projects.</p>
        <div>
          <a href="#/register" class="btn btn-primary">Get Started Free</a>
          <a href="#/courses" class="btn btn-outline">Explore Courses</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="https://via.placeholder.com/500x400?text=Code+Editor+Preview" style="max-width:100%; border-radius:var(--border-radius);">
      </div>
    </section>
    <h2 style="text-align:center; margin:3rem 0 1rem;">Featured Courses</h2>
    <div class="courses-grid" id="coursesGrid"></div>
  `;
  // Load courses
  const courses = [
    { id: 'html', title: 'HTML', category: 'frontend', icon: 'fab fa-html5', color: '#e34f26' },
    { id: 'css', title: 'CSS', category: 'frontend', icon: 'fab fa-css3-alt', color: '#264de4' },
    { id: 'javascript', title: 'JavaScript', category: 'frontend', icon: 'fab fa-js-square', color: '#f7df1e' },
    { id: 'python', title: 'Python', category: 'backend', icon: 'fab fa-python', color: '#3776ab' },
    { id: 'java', title: 'Java', category: 'backend', icon: 'fab fa-java', color: '#007396' },
    { id: 'csharp', title: 'C#', category: 'backend', icon: 'fab fa-microsoft', color: '#68217a' },
    { id: 'cpp', title: 'C++', category: 'backend', icon: 'fas fa-code', color: '#00599c' }
  ];
  document.getElementById('coursesGrid').innerHTML = courses.map(c => `
    <div class="course-card" onclick="router.navigate('/courses/${c.id}')">
      <div class="course-icon" style="color:${c.color}"><i class="${c.icon}"></i></div>
      <div class="course-title">${c.title}</div>
      <div class="course-category">${c.category}</div>
      <p>Learn ${c.title} from scratch with hands-on projects.</p>
    </div>
  `).join('');
}

function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-container">
      <h2>Login to Your Account</h2>
      <form id="loginForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" required placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" required placeholder="••••••••">
        </div>
        <div class="form-group checkbox">
          <input type="checkbox" id="remember">
          <label for="remember">Remember me</label>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Login</button>
        <div class="auth-link">
          Don't have an account? <a href="#/register">Register</a>
        </div>
        <div id="errorMsg" style="color:red; margin-top:1rem;"></div>
      </form>
    </div>
  `;
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);
  });
}

function renderRegister() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-container">
      <h2>Create an Account</h2>
      <form id="registerForm">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" required placeholder="John Doe">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" required placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" required placeholder="••••••••">
        </div>
        <div class="form-group">
          <label for="confirm">Confirm Password</label>
          <input type="password" id="confirm" required placeholder="••••••••">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Register</button>
        <div class="auth-link">
          Already have an account? <a href="#/login">Login</a>
        </div>
        <div id="errorMsg" style="color:red; margin-top:1rem;"></div>
      </form>
    </div>
  `;
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;
    if (password !== confirm) {
      document.getElementById('errorMsg').textContent = 'Passwords do not match';
      return;
    }
    await register(name, email, password);
  });
}

async function renderDashboard() {
  if (!appState.user) {
    router.navigate('/login');
    return;
  }
  const app = document.getElementById('app');
  app.innerHTML = `<div class="spinner"></div>`;
  const data = await apiRequest('/progress');
  if (!data) return;
  const stats = data.stats || { coursesEnrolled: 0, lessonsCompleted: 0, quizzesPassed: 0, projectsDone: 0 };
  app.innerHTML = `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Welcome back, ${appState.user.name}!</h1>
      </div>
      <div class="progress-stats">
        <div class="stat-card">
          <div class="stat-value">${stats.coursesEnrolled}</div>
          <div class="stat-label">Courses Enrolled</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.lessonsCompleted}</div>
          <div class="stat-label">Lessons Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.quizzesPassed}</div>
          <div class="stat-label">Quizzes Passed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.projectsDone}</div>
          <div class="stat-label">Projects</div>
        </div>
      </div>
      <h2>Your Courses</h2>
      <div class="enrolled-courses" id="enrolledCourses"></div>
    </div>
  `;
  const courses = ['HTML','CSS','JavaScript','Python','Java','C#','C++'];
  const enrolledDiv = document.getElementById('enrolledCourses');
  enrolledDiv.innerHTML = courses.map(course => {
    const prog = data.progress?.find(p => p.courseId === course.toLowerCase()) || { lessonsCompleted: [] };
    const totalLessons = 6; // example
    const percent = (prog.lessonsCompleted.length / totalLessons) * 100;
    return `
      <div class="course-progress-card">
        <h3>${course}</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${percent}%"></div>
        </div>
        <p>${Math.round(percent)}% complete</p>
        <button class="btn btn-primary" onclick="router.navigate('/courses/${course.toLowerCase()}')">Continue</button>
      </div>
    `;
  }).join('');
}

function renderCourses() {
  // Show list of all courses (similar to home but without hero)
  const app = document.getElementById('app');
  app.innerHTML = `<h2 style="text-align:center;">All Courses</h2><div class="courses-grid" id="allCoursesGrid"></div>`;
  const courses = [
    { id: 'html', title: 'HTML', category: 'frontend', icon: 'fab fa-html5', color: '#e34f26' },
    { id: 'css', title: 'CSS', category: 'frontend', icon: 'fab fa-css3-alt', color: '#264de4' },
    { id: 'javascript', title: 'JavaScript', category: 'frontend', icon: 'fab fa-js-square', color: '#f7df1e' },
    { id: 'python', title: 'Python', category: 'backend', icon: 'fab fa-python', color: '#3776ab' },
    { id: 'java', title: 'Java', category: 'backend', icon: 'fab fa-java', color: '#007396' },
    { id: 'csharp', title: 'C#', category: 'backend', icon: 'fab fa-microsoft', color: '#68217a' },
    { id: 'cpp', title: 'C++', category: 'backend', icon: 'fas fa-code', color: '#00599c' }
  ];
  document.getElementById('allCoursesGrid').innerHTML = courses.map(c => `
    <div class="course-card" onclick="router.navigate('/courses/${c.id}')">
      <div class="course-icon" style="color:${c.color}"><i class="${c.icon}"></i></div>
      <div class="course-title">${c.title}</div>
      <div class="course-category">${c.category}</div>
      <p>Learn ${c.title} from scratch.</p>
    </div>
  `).join('');
}

function renderCourse(courseId) {
  const courseData = {
    html: { title: 'HTML', icon: 'fab fa-html5', color: '#e34f26', lessons: [
      { id: 'intro', title: 'Introduction' },
      { id: 'lesson1', title: 'HTML Elements' },
      { id: 'lesson2', title: 'HTML Attributes' },
      { id: 'lesson3', title: 'Headings & Paragraphs' },
      { id: 'lesson4', title: 'Links & Images' },
      { id: 'lesson5', title: 'Lists & Tables' },
      { id: 'lesson6', title: 'Forms' },
      { id: 'quiz', title: 'Quiz' },
      { id: 'project', title: 'Mini Project' }
    ] },
    // Similar for other courses (simplified for brevity)
    css: { title: 'CSS', icon: 'fab fa-css3-alt', color: '#264de4', lessons: [] },
    javascript: { title: 'JavaScript', icon: 'fab fa-js-square', color: '#f7df1e', lessons: [] },
    python: { title: 'Python', icon: 'fab fa-python', color: '#3776ab', lessons: [] },
    java: { title: 'Java', icon: 'fab fa-java', color: '#007396', lessons: [] },
    csharp: { title: 'C#', icon: 'fab fa-microsoft', color: '#68217a', lessons: [] },
    cpp: { title: 'C++', icon: 'fas fa-code', color: '#00599c', lessons: [] }
  };
  const course = courseData[courseId];
  if (!course) { router.navigate('/404'); return; }

  // Load progress from localStorage (or server later)
  let completed = JSON.parse(localStorage.getItem(`progress_${courseId}`)) || [];

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="course-page">
      <aside class="sidebar">
        <h3>${course.title} Course</h3>
        <ul>
          ${course.lessons.map(l => `<li><a href="#/courses/${courseId}/${l.id}" class="${l.id === 'intro' ? 'active' : ''}">${l.title}</a></li>`).join('')}
        </ul>
        <div class="progress-bar" style="margin-top:2rem;">
          <div class="progress-fill" id="courseProgress" style="width:${(completed.length/(course.lessons.length-2))*100}%"></div>
        </div>
        <p>Progress: <span id="progressPercent">${Math.round((completed.length/(course.lessons.length-2))*100)}%</span></p>
      </aside>
      <main class="main-content" id="courseMain"></main>
    </div>
  `;

  // Load first lesson by default
  showLesson(courseId, 'intro');

  // Handle lesson clicks
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const lessonId = link.getAttribute('href').split('/').pop();
      showLesson(courseId, lessonId);
      document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    });
  });

  function showLesson(courseId, lessonId) {
    const main = document.getElementById('courseMain');
    if (lessonId === 'intro') {
      main.innerHTML = `
        <h1 class="lesson-title">Introduction to ${course.title}</h1>
        <p>${course.title} is a fundamental language for web development.</p>
        <h3>Learning Objectives</h3>
        <ul>
          <li>Understand basic syntax</li>
          <li>Write simple programs</li>
        </ul>
        <button class="btn btn-primary" onclick="markLesson('${courseId}', '${lessonId}')">Mark as Completed</button>
      `;
    } else if (lessonId === 'quiz') {
      main.innerHTML = `
        <h2>${course.title} Quiz</h2>
        <div id="quizContainer"></div>
      `;
      loadQuiz(courseId);
    } else if (lessonId === 'project') {
      main.innerHTML = `
        <h2>Mini Project: Build something with ${course.title}</h2>
        <p>Create a simple project using the concepts learned.</p>
        <button class="btn btn-primary" onclick="startProject('${courseId}')">Start Project</button>
      `;
    } else {
      // Generic lesson content
      main.innerHTML = `
        <h2 class="lesson-title">${lessonId.replace(/([A-Z])/g, ' $1')}</h2>
        <p>This lesson covers important concepts.</p>
        <div class="code-block">
          <button class="copy-btn" onclick="copyCode(this)">Copy</button>
          <pre><code>// Example code for ${course.title}</code></pre>
        </div>
        <button class="btn btn-primary" onclick="markLesson('${courseId}', '${lessonId}')">Mark as Completed</button>
      `;
    }
  }

  window.markLesson = function(courseId, lessonId) {
    let completed = JSON.parse(localStorage.getItem(`progress_${courseId}`)) || [];
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      localStorage.setItem(`progress_${courseId}`, JSON.stringify(completed));
      // Update progress bar
      const totalLessons = course.lessons.length - 2; // excluding quiz/project
      const percent = (completed.length / totalLessons) * 100;
      document.getElementById('courseProgress').style.width = percent + '%';
      document.getElementById('progressPercent').textContent = Math.round(percent) + '%';
      // Also send to server if logged in
      if (appState.token) {
        apiRequest('/progress/lesson', {
          method: 'POST',
          body: JSON.stringify({ courseId, lessonId })
        });
      }
    }
  };

  window.copyCode = function(btn) {
    const code = btn.nextElementSibling.textContent;
    navigator.clipboard.writeText(code);
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  };

  function loadQuiz(courseId) {
    const quizData = {
      html: [
        { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlinks Text Machine Language"], correct: 0 }
      ]
    };
    const questions = quizData[courseId] || quizData.html;
    const container = document.getElementById('quizContainer');
    let currentQ = 0;
    let score = 0;

    function renderQuestion() {
      if (currentQ >= questions.length) {
        container.innerHTML = `<h3>Quiz completed! Score: ${score}/${questions.length}</h3>`;
        if (score >= questions.length * 0.7) {
          // Mark quiz as passed
          apiRequest('/progress/quiz', { method: 'POST', body: JSON.stringify({ courseId, quizId: 'quiz1' }) });
        }
        return;
      }
      const q = questions[currentQ];
      container.innerHTML = `
        <div class="quiz-question">${q.question}</div>
        ${q.options.map((opt, idx) => `<div class="quiz-option" data-index="${idx}">${opt}</div>`).join('')}
        <button class="btn btn-primary" id="nextQuiz">Next</button>
      `;
      document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', function() {
          document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          this.classList.add('selected');
        });
      });
      document.getElementById('nextQuiz').addEventListener('click', () => {
        const selected = document.querySelector('.quiz-option.selected');
        if (!selected) return;
        const ans = parseInt(selected.dataset.index);
        if (ans === q.correct) score++;
        currentQ++;
        renderQuestion();
      });
    }
    renderQuestion();
  }

  window.startProject = function(courseId) {
    alert('Project started! In a full implementation, this would open a code editor.');
  };
}

// ==================== ROUTE DEFINITIONS ====================
router.addRoute('/', renderHome);
router.addRoute('/courses', renderCourses);
router.addRoute('/login', renderLogin);
router.addRoute('/register', renderRegister);
router.addRoute('/dashboard', renderDashboard);
router.addRoute('/404', () => document.getElementById('app').innerHTML = '<h1>404 - Page Not Found</h1>');

// Dynamic course routes
router.addRoute('/courses/html', () => renderCourse('html'));
router.addRoute('/courses/css', () => renderCourse('css'));
router.addRoute('/courses/javascript', () => renderCourse('javascript'));
router.addRoute('/courses/python', () => renderCourse('python'));
router.addRoute('/courses/java', () => renderCourse('java'));
router.addRoute('/courses/csharp', () => renderCourse('csharp'));
router.addRoute('/courses/cpp', () => renderCourse('cpp'));

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  // Check stored user
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    appState.user = JSON.parse(storedUser);
  }
  updateNav();
  router.init();

  // Logout handler
  document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
});

// Mobile menu toggle
window.toggleMenu = function() {
  document.getElementById('navLinks').classList.toggle('active');
};

// Theme toggle
window.toggleTheme = function() {
  document.body.classList.toggle('dark-theme');
  const icon = document.querySelector('.theme-toggle i');
  if (document.body.classList.contains('dark-theme')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
};

// Expose router globally for onclick
window.router = router;