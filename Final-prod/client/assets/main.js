const API_URL = "http://localhost:3000/api";
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let likedPosts = new Set(JSON.parse(localStorage.getItem('likedPosts') || '[]'));
let userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');

// 1. Сохранение состояния приложения
function saveAppState() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('likedPosts', JSON.stringify([...likedPosts]));
    localStorage.setItem('userPosts', JSON.stringify(userPosts));
}

// 2. Функции аутентификации
async function register(username, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.trim(),
                password: password
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Ошибка регистрации');
        }

        saveAuthData(data.token, data.user);
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.trim(),
                password: password
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Ошибка входа');
        }

        saveAuthData(data.token, data.user);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

function saveAuthData(token, user) {
    localStorage.setItem('authToken', token);
    currentUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar || '../images/Profile.svg',
        bio: user.bio || ''
    };
    saveAppState();
    updateAuthUI();
}

function clearAuthData() {
    localStorage.removeItem('authToken');
    currentUser = null;
    saveAppState();
    updateAuthUI();
    redirectUnauthenticated();
}

function redirectUnauthenticated() {
    const allowedPages = ['index.html', 'signup.html', 'login.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!allowedPages.includes(currentPage)) {
        window.location.href = '/pages/index.html';
    }
}

// 3. Загрузка контента для всех страниц
function loadContent() {
    const path = window.location.pathname;
    const currentPage = path.split('/').pop();
    
    const publicPages = ['index.html', 'signup.html', 'login.html'];
    
    if (!currentUser && !publicPages.includes(currentPage)) {
        redirectUnauthenticated();
        return;
    }

    if (currentPage === 'index.html') {
        loadIndexContent();
    } else if (currentPage === 'auth.html') {
        loadAuthContent();
    } else if (currentPage === 'profile.html') {
        loadProfileContent();
    } else if (currentPage === 'comments.html') {
        loadCommentsContent();
    } else if (currentPage === 'search-users.html') {
        loadSearchUsersContent();
    } else if (currentPage === 'search-posts.html') {
        loadSearchPostsContent();
    }
}

function loadIndexContent() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.innerHTML = `
        <article class="post" data-post-id="1">
            <div class="post-header">
                <img src="../images/seneka.svg" alt="Сенека" class="avatar" />
                <h1 class="post-title">Луций Анней Сенека</h1>
            </div>
            <p class="post-content">
                Человек, которого застеклённые окна защищали от малейшего дуновения,
                на чьих ногах постоянно менялись мягкие согревающие повязки, у кого в
                столовой под полом и в стенах всегда работало отопление, подвергается
                смертельной опасности, даже если его коснётся самый лёгкий ветерок.
            </p>
            <div class="post-footer">
                <button class="action-btn like-btn" ${!currentUser ? 'disabled title="Для взаимодействия войдите в систему"' : ''}>
                    <img src="../images/heartt.svg" alt="Лайк" class="icon-heart" />
                    <span class="counter">13</span>
                </button>
                <button class="action-btn comment-btn" ${!currentUser ? 'disabled title="Для взаимодействия войдите в систему"' : ''}>
                    <span>Комментарии</span>
                    <span class="counter-comment">7</span>
                </button>
            </div>
        </article>

        <article class="post" data-post-id="2">
            <div class="post-header">
                <img src="../images/seneka.svg" alt="Сенека" class="avatar" />
                <h1 class="post-title">Луций Анней Сенека</h1>
            </div>
            <p class="post-content">
                Говорят, что Гай Цезарь отличался помимо прочих немалочисленных своих
                пороков каким-то удивительным сладострастием в оскорблениях; ему
                непременно нужно было на всякого повесить какой-нибудь обидный ярлык...
            </p>
            <div class="post-footer">
                <button class="action-btn like-btn" ${!currentUser ? 'disabled title="Для взаимодействия войдите в систему"' : ''}>
                    <img src="../images/heartt.svg" alt="Лайк" class="icon-heart" />
                    <span class="counter">7</span>
                </button>
                <button class="action-btn comment-btn" ${!currentUser ? 'disabled title="Для взаимодействия войдите в систему"' : ''}>
                    <span>Комментарии</span>
                    <span class="counter-comment">3</span>
                </button>
            </div>
        </article>
    `;

    if (!currentUser) {
        const message = document.createElement('div');
        message.className = 'auth-message';
        message.innerHTML = `
            <p>Для взаимодействия с постами войдите или зарегистрируйтесь</p>
            <div class="auth-actions">
                <a href="/pages/signup.html" class="btn">Зарегистрироваться</a>
                <a href="/pages/login.html" class="btn">Войти</a>
            </div>
        `;
        container.appendChild(message);
    }
}

function loadAuthContent() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    let postsHTML = `
        <article class="post" data-post-id="1">
            <div class="post-header">
                <img src="../images/seneka.svg" alt="Сенека" class="avatar" />
                <h1 class="post-title">Луций Анней Сенека</h1>
            </div>
            <p class="post-content">
                Человек, которого застеклённые окна защищали от малейшего дуновения,
                на чьих ногах постоянно менялись мягкие согревающие повязки, у кого в
                столовой под полом и в стенах всегда работало отопление, подвергается
                смертельной опасности, даже если его коснётся самый лёгкий ветерок.
            </p>
            <div class="post-footer">
                <button class="action-btn like-btn ${likedPosts.has('1') ? 'liked' : ''}">
                    <img src="../images/heartt.svg" alt="Лайк" class="icon-heart" />
                    <span class="counter">${likedPosts.has('1') ? '14' : '13'}</span>
                </button>
                <button class="action-btn comment-btn" onclick="location.href='/pages/comments.html?postId=1'">
                    <span>Комментарии</span>
                    <span class="counter-comment">7</span>
                </button>
            </div>
        </article>

        <article class="post" data-post-id="2">
            <div class="post-header">
                <img src="../images/seneka.svg" alt="Сенека" class="avatar" />
                <h1 class="post-title">Луций Анней Сенека</h1>
            </div>
            <p class="post-content">
                Говорят, что Гай Цезарь отличался помимо прочих немалочисленных своих пороков...
            </p>
            <div class="post-footer">
                <button class="action-btn like-btn ${likedPosts.has('2') ? 'liked' : ''}">
                    <img src="../images/heartt.svg" alt="Лайк" class="icon-heart" />
                    <span class="counter">${likedPosts.has('2') ? '8' : '7'}</span>
                </button>
                <button class="action-btn comment-btn" onclick="location.href='/pages/comments.html?postId=2'">
                    <span>Комментарии</span>
                    <span class="counter-comment">3</span>
                </button>
            </div>
        </article>
    `;

    userPosts.forEach(post => {
        postsHTML += `
            <article class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.avatar || '../images/Profile.svg'}" alt="${post.username}" class="avatar" />
                    <h1 class="post-title">${post.username}</h1>
                </div>
                <p class="post-content">${post.content}</p>
                <div class="post-footer">
                    <button class="action-btn like-btn ${likedPosts.has(post.id) ? 'liked' : ''}">
                        <img src="../images/heartt.svg" alt="Лайк" class="icon-heart" />
                        <span class="counter">${post.likes || 0}</span>
                    </button>
                    <button class="action-btn comment-btn" onclick="location.href='/pages/comments.html?postId=${post.id}'">
                        <span>Комментарии</span>
                        <span class="counter-comment">${post.comments?.length || 0}</span>
                    </button>
                </div>
            </article>
        `;
    });

    container.innerHTML = postsHTML;
}

function loadProfileContent() {
    const profileContainer = document.getElementById('user-profile');
    const postsContainer = document.getElementById('user-posts');
    const postForm = document.getElementById('post-form');

    if (profileContainer) {
        profileContainer.innerHTML = `
            <div class="profile-header">
                <div class="avatar-container">
                    <img src="${currentUser.avatar}" alt="Аватар" class="avatar" />
                    <button class="change-avatar-btn">Изменить фото</button>
                </div>
                <div class="profile-info">
                    <div class="title-wrapper">
                        <h1 class="profile-title">${currentUser.username}</h1>
                        <img src="../images/edit.svg" alt="Редактировать" class="icon-edit" />
                    </div>
                    <div class="bio-wrapper">
                        <p class="profile-bio">${currentUser.bio || 'Расскажите о себе'}</p>
                        <img src="../images/edit.svg" alt="Редактировать" class="icon-edit" />
                    </div>
                </div>
            </div>
        `;
    }

    if (postsContainer) {
        const userPostsHTML = userPosts
            .filter(post => post.username === currentUser.username)
            .map(post => `
                <article class="post" data-post-id="${post.id}">
                    <div class="post-header">
                        <img src="${post.avatar || '../images/Profile.svg'}" alt="${post.username}" class="avatar" />
                        <h1 class="post-title">${post.username}</h1>
                    </div>
                    <p class="post-content">${post.content}</p>
                    <div class="post-footer">
                        <button class="action-btn like-btn ${likedPosts.has(post.id) ? 'liked' : ''}">
                            <img src="../images/heartt.svg" alt="Лайк" class="icon-heart" />
                            <span class="counter">${post.likes || 0}</span>
                        </button>
                        <button class="action-btn comment-btn" onclick="location.href='/pages/comments.html?postId=${post.id}'">
                            <span>Комментарии</span>
                            <span class="counter-comment">${post.comments?.length || 0}</span>
                        </button>
                        <button class="action-btn delete-btn">
                            <img src="../images/delete.svg" alt="Удалить" class="icon-delete" />
                        </button>
                    </div>
                </article>
            `).join('');

        postsContainer.innerHTML = userPostsHTML || '<p class="no-posts">Вы еще не опубликовали ни одного поста</p>';
    }

    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const textarea = postForm.querySelector('.comment-input');
            const content = textarea.value.trim();

            if (content) {
                const newPost = {
                    id: 'post_' + Date.now(),
                    username: currentUser.username,
                    avatar: currentUser.avatar,
                    content: content,
                    likes: 0,
                    comments: [],
                    timestamp: new Date().toISOString()
                };

                userPosts.unshift(newPost);
                saveAppState();
                textarea.value = '';
                showMessage('Пост опубликован!', 'success');
                loadProfileContent();
                
                if (window.location.pathname.includes('auth.html')) {
                    loadAuthContent();
                }
            }
        });
    }
}

function loadCommentsContent() {
    const postContainer = document.getElementById('post-container');
    const commentsContainer = document.getElementById('comments-container');
    const commentForm = document.getElementById('comment-form');

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId') || '1';
    const post = getPostById(postId);

    if (postContainer && post) {
        postContainer.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar || '../images/seneka.svg'}" alt="${post.username}" class="avatar" />
                <h1 class="post-title">${post.username}</h1>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-footer">
                <button class="action-btn like-btn ${likedPosts.has(post.id) ? 'liked' : ''}">
                    <img src="../images/heartt.svg" alt="Лайк" class="icon-heart" />
                    <span class="counter">${post.likes || 0}</span>
                </button>
                <button class="action-btn comment-btn">
                    <span>Комментарии</span>
                    <span class="counter-comment">${post.comments?.length || 0}</span>
                </button>
            </div>
        `;
    }

    if (commentsContainer && post) {
        commentsContainer.innerHTML = post.comments?.length ? post.comments.map(comment => `
            <article class="comment">
                <div class="comment-header">
                    <img src="${comment.avatar || '../images/Profile.svg'}" alt="${comment.username}" class="avatar-comment" />
                    <h1 class="comment-title">${comment.username}</h1>
                </div>
                <div class="comment-content-container">
                    <p class="comment-content">
                        ${comment.content}
                        ${comment.username === currentUser?.username ? 
                          `<img src="../images/delete.svg" alt="Удалить" class="icon-delete" data-comment-id="${comment.id}" />` : ''}
                    </p>
                </div>
            </article>
        `).join('') : '<p>Пока нет комментариев</p>';
    }

    if (commentForm && currentUser) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const textarea = commentForm.querySelector('.comment-input');
            const content = textarea.value.trim();

            if (content && post) {
                const newComment = {
                    id: 'comment_' + Date.now(),
                    username: currentUser.username,
                    avatar: currentUser.avatar,
                    content: content,
                    timestamp: new Date().toISOString()
                };

                if (!post.comments) {
                    post.comments = [];
                }
                post.comments.push(newComment);
                saveAppState();
                showMessage('Комментарий добавлен!', 'success');
                textarea.value = '';
                loadCommentsContent();
            }
        });
    }
}

function getPostById(postId) {
    if (postId === '1') {
        return {
            id: '1',
            username: 'Луций Анней Сенека',
            avatar: '../images/seneka.svg',
            content: 'Человек, которого застеклённые окна защищали от малейшего дуновения, на чьих ногах постоянно менялись мягкие согревающие повязки, у кого в столовой под полом и в стенах всегда работало отопление, подвергается смертельной опасности, даже если его коснётся самый лёгкий ветерок.',
            likes: 13,
            comments: [
                {
                    id: 'comment_1',
                    username: 'Калигула',
                    avatar: '../images/kaligula.svg',
                    content: 'Школярство чистой воды',
                    timestamp: new Date().toISOString()
                }
            ]
        };
    } else if (postId === '2') {
        return {
            id: '2',
            username: 'Луций Анней Сенека',
            avatar: '../images/seneka.svg',
            content: 'Говорят, что Гай Цезарь отличался помимо прочих немалочисленных своих пороков каким-то удивительным сладострастием в оскорблениях; ему непременно нужно было на всякого повесить какой-нибудь обидный ярлык...',
            likes: 7,
            comments: []
        };
    }
    return userPosts.find(p => p.id === postId);
}

function loadSearchUsersContent() {
    const usersList = document.getElementById('users-list');
    const searchInput = document.getElementById('search-input');
    const postsTab = document.getElementById('posts-tab');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterUsers(searchTerm);
        });
    }

    if (postsTab) {
        postsTab.addEventListener('click', () => {
            window.location.href = '/pages/search-posts.html';
        });
    }

    filterUsers('');
}

function filterUsers(searchTerm) {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;

    const allUsers = [
        {
            username: 'Гай Юлий Цезарь Випсаниан',
            avatar: '../images/vipsanian.svg'
        },
        {
            username: 'Гай Юлий Гигин',
            avatar: '../images/placeholder-single.svg'
        },
        {
            username: 'Гай Юлий Цезарь Октавиан Август',
            avatar: '../images/caesar-august.svg'
        },
        ...userPosts.reduce((acc, post) => {
            if (!acc.some(u => u.username === post.username)) {
                acc.push({
                    username: post.username,
                    avatar: post.avatar
                });
            }
            return acc;
        }, [])
    ];

    const filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    usersList.innerHTML = filteredUsers.map(user => `
        <li class="user-item">
            <img src="${user.avatar}" alt="${user.username}" class="user-avatar" />
            <span class="user-name">${user.username}</span>
        </li>
    `).join('');
}

function loadSearchPostsContent() {
    const resultsContainer = document.getElementById('search-results');
    const searchInput = document.getElementById('search-input');
    const usersTab = document.getElementById('users-tab');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterPosts(searchTerm);
        });
    }

    if (usersTab) {
        usersTab.addEventListener('click', () => {
            window.location.href = '/pages/search-users.html';
        });
    }

    filterPosts('');
}

function filterPosts(searchTerm) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    const allPosts = [
        {
            id: '1',
            username: 'Луций Анней Сенека',
            avatar: '../images/seneka.svg',
            content: 'Человек, которого застеклённые окна защищали от малейшего дуновения, на чьих ногах постоянно менялись мягкие согревающие повязки, у кого в столовой под полом и в стенах всегда работало отопление, подвергается смертельной опасности, даже если его коснётся самый лёгкий ветерок.',
            likes: 13,
            comments: []
        },
        {
            id: '2',
            username: 'Луций Анней Сенека',
            avatar: '../images/seneka.svg',
            content: 'Говорят, что Гай Цезарь отличался помимо прочих немалочисленных своих пороков каким-то удивительным сладострастием в оскорблениях; ему непременно нужно было на всякого повесить какой-нибудь обидный ярлык...',
            likes: 7,
            comments: []
        },
        ...userPosts
    ];

    const filteredPosts = allPosts.filter(post => 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    resultsContainer.innerHTML = filteredPosts.map(post => `
        <article class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.avatar}" alt="${post.username}" class="avatar" />
                <h1 class="post-title">${post.username}</h1>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-footer">
                <button class="action-btn like-btn ${likedPosts.has(post.id) ? 'liked' : ''}">
                    <img src="../images/heartt.svg" alt="Лайк" class="icon-heart" />
                    <span class="counter">${post.likes || 0}</span>
                </button>
                <button class="action-btn comment-btn" onclick="location.href='/pages/comments.html?postId=${post.id}'">
                    <span>Комментарии</span>
                    <span class="counter-comment">${post.comments?.length || 0}</span>
                </button>
            </div>
        </article>
    `).join('');
}

// 4. Обработчики событий
function setupEventListeners() {
    // Лайки
    document.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn')) {
            const likeBtn = e.target.closest('.like-btn');
            const postId = likeBtn.closest('.post').dataset.postId;
            
            if (likedPosts.has(postId)) {
                likedPosts.delete(postId);
                likeBtn.classList.remove('liked');
            } else {
                likedPosts.add(postId);
                likeBtn.classList.add('liked');
            }
            
            const counter = likeBtn.querySelector('.counter');
            counter.textContent = parseInt(counter.textContent) + (likedPosts.has(postId) ? 1 : -1);
            saveAppState();
        }
    });

    // Редактирование профиля
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('icon-edit')) {
            const editIcon = e.target;
            const container = editIcon.closest('.title-wrapper, .bio-wrapper');
            const textElement = container.querySelector('h1, p');
            const currentText = textElement.textContent;
            const isTitle = textElement.tagName === 'H1';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.className = 'edit-input';
            if (isTitle) input.classList.add('edit-title');
            
            textElement.replaceWith(input);
            input.focus();
            
            const saveEdit = () => {
                const newText = input.value.trim();
                if (newText && newText !== currentText) {
                    textElement.textContent = newText;
                    
                    if (isTitle) {
                        currentUser.username = newText;
                    } else {
                        currentUser.bio = newText;
                    }
                    
                    saveAppState();
                    showMessage('Изменения сохранены!', 'success');
                }
                input.replaceWith(textElement);
            };
            
            input.addEventListener('blur', saveEdit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveEdit();
            });
        }
    });

    // Смена аватарки
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('change-avatar-btn')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = () => {
                if (input.files && input.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        currentUser.avatar = event.target.result;
                        
                        document.querySelectorAll('.avatar, .icon-profile').forEach(img => {
                            img.src = event.target.result;
                        });
                        
                        userPosts = userPosts.map(post => {
                            if (post.username === currentUser.username) {
                                return { ...post, avatar: event.target.result };
                            }
                            return post;
                        });
                        
                        saveAppState();
                        showMessage('Аватар обновлен!', 'success');
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            };
            
            input.click();
        }
    });

    // Удаление поста
    document.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            if (confirm('Вы уверены, что хотите удалить этот пост?')) {
                const post = e.target.closest('.post');
                const postId = post.dataset.postId;
                
                userPosts = userPosts.filter(p => p.id !== postId);
                likedPosts.delete(postId);
                saveAppState();
                
                post.remove();
                showMessage('Пост удален', 'success');
            }
        }
    });

    // Удаление комментария
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('icon-delete') && e.target.closest('.comment-content')) {
            if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
                const commentId = e.target.dataset.commentId;
                const postId = new URLSearchParams(window.location.search).get('postId');
                const post = getPostById(postId);
                
                if (post && post.comments) {
                    post.comments = post.comments.filter(c => c.id !== commentId);
                    saveAppState();
                    loadCommentsContent();
                    showMessage('Комментарий удален', 'success');
                }
            }
        }
    });

    // Формы авторизации
    document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const username = form.elements.username.value.trim();
            const password = form.elements.password.value;
            const confirmPassword = form.elements['confirm-password'].value;

            if (password !== confirmPassword) {
                throw new Error('Пароли не совпадают');
            }
            if (password.length < 6) {
                throw new Error('Пароль должен содержать минимум 6 символов');
            }
            if (username.length < 3) {
                throw new Error('Имя пользователя должно содержать минимум 3 символа');
            }

            await register(username, password);
            showMessage('Регистрация прошла успешно!', 'success');
            window.location.href = '/pages/profile.html';
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });

    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            await login(form.elements.username.value.trim(), form.elements.password.value);
            showMessage('Вход выполнен успешно!', 'success');
            window.location.href = '/pages/profile.html';
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Выход
    document.addEventListener('click', (e) => {
        if (e.target.closest('.logout-btn')) {
            e.preventDefault();
            clearAuthData();
            showMessage('Вы вышли из системы', 'success');
        }
    });

    // Поиск
    document.querySelectorAll('.search-input:not(#search-input)').forEach(input => {
        input.addEventListener('click', () => {
            window.location.href = '/pages/search-users.html';
        });
    });
}

// 5. Вспомогательные функции
function updateAuthUI() {
    const authLinks = document.querySelector('.auth-links');
    if (!authLinks) return;

    if (currentUser) {
        authLinks.innerHTML = `
            <button class="logout-btn">
                Выход
                <img src="../images/arrow-in-right.svg" alt="Выход" class="icon-arrow">
            </button>
            <a href="/pages/profile.html">
                <img src="${currentUser.avatar}" alt="Профиль" class="icon-profile">
            </a>
        `;
    } else {
        authLinks.innerHTML = `
            <a href="/pages/signup.html" class="auth-link">
                Зарегистрироваться
                <img src="../images/arrow-in-right.svg" alt="Стрелка" class="icon-arrow">
            </a>
            <a href="/pages/login.html" class="auth-link">
                Войти
                <img src="../images/arrow-in-right.svg" alt="Стрелка" class="icon-arrow">
            </a>
        `;
    }
}

function showMessage(message, type = 'error') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// 6. Инициализация приложения
function initApp() {
    if (localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    if (localStorage.getItem('likedPosts')) {
        likedPosts = new Set(JSON.parse(localStorage.getItem('likedPosts')));
    }
    if (localStorage.getItem('userPosts')) {
        userPosts = JSON.parse(localStorage.getItem('userPosts'));
    }

    const style = document.createElement('style');
    style.textContent = `
        .liked .icon-heart {
            filter: hue-rotate(300deg) saturate(3);
        }
        .like-btn {
            transition: all 0.3s ease;
        }
        .like-btn.liked {
            color: #ff0000;
        }
        .like-btn:active {
            transform: scale(1.2);
        }
        .avatar-container {
            position: relative;
            display: inline-block;
            margin-bottom: 20px;
        }
        .change-avatar-btn {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 0 0 50% 50%;
            width: 100%;
            text-align: center;
        }
        .message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s;
        }
        .message.error {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #ef9a9a;
        }
        .message.success {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #a5d6a7;
        }
        .edit-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: inherit;
            font-family: inherit;
        }
        .edit-title {
            font-size: 1.5em;
            font-weight: bold;
        }
        .no-posts {
            text-align: center;
            color: #666;
            padding: 20px;
        }
        @keyframes fadeIn {
            from { opacity: 0; top: 10px; }
            to { opacity: 1; top: 20px; }
        }
    `;
    document.head.appendChild(style);

    loadContent();
    updateAuthUI();
    setupEventListeners();

    window.addEventListener('beforeunload', saveAppState);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);