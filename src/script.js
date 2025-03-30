// 首页功能
if (window.location.pathname.endsWith('index.html')) {
    // 显示全屏提示
    function showFullscreenPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'fullscreen-prompt';
        prompt.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
            opacity: 1;
            transition: opacity 1s ease-out;
        `;
        prompt.innerHTML = '<p>请将窗口放大到全屏使用</p>';
        document.body.appendChild(prompt);

        // 5秒后渐隐
        setTimeout(() => {
            prompt.style.opacity = '0';
            // 等待渐隐动画完成后移除元素
            setTimeout(() => {
                prompt.remove();
            }, 1000);
        }, 5000);
    }

    // 播放背景音乐
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.play().catch(error => console.log('自动播放被阻止:', error));
    }

    // 图片切换功能
    const images = document.querySelectorAll('.fullscreen-image');
    let currentImageIndex = 0;
    let isThirdImage = false;

    function switchImage(direction = 'next') {
        // 在第一张图片时，向前切换不做任何操作
        if (currentImageIndex === 0 && direction === 'prev') {
            return;
        }

        if (isThirdImage && direction === 'next') {
            window.location.href = 'meditation.html';
            return;
        }

        // 移除当前图片的active类
        images[currentImageIndex].classList.remove('active');
        
        // 更新索引
        if (direction === 'next') {
            currentImageIndex = (currentImageIndex + 1) % images.length;
        } else {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        }
        
        // 添加active类到新图片
        images[currentImageIndex].classList.add('active');

        // 检查是否到达第三张图片
        isThirdImage = currentImageIndex === 2;
    }

    // 点击切换到下一张
    document.addEventListener('click', () => switchImage('next'));

    // 键盘方向键控制
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                switchImage('next');
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                switchImage('prev');
                break;
        }
    });

    // 页面加载完成后显示提示
    window.addEventListener('load', showFullscreenPrompt);

    // 检查是否从冥想页面返回
    if (sessionStorage.getItem('returnToLastImage')) {
        // 清除标记
        sessionStorage.removeItem('returnToLastImage');
        // 直接显示最后一张图片
        const images = document.querySelectorAll('.fullscreen-image');
        images.forEach(img => img.classList.remove('active'));
        images[2].classList.add('active');
        currentImageIndex = 2;
        isThirdImage = true;
    }
}

// 倒计时页面功能
if (document.querySelector('.countdown-container')) {
    const timer = document.querySelector('.timer');
    const progressBar = document.querySelector('.progress-bar');
    const progressHandle = document.querySelector('.progress-handle');
    const progressContainer = document.querySelector('.progress-container');
    const alertSound = document.getElementById('alertSound');
    
    // 根据当前页面设置不同的倒计时时间
    let totalTime;
    const currentPage = window.location.pathname.split('/').pop() || 'countdown1.html';
    
    // 设置不同页面的倒计时时间
    if (currentPage.match(/countdown[1-3]\.html/)) {
        totalTime = 1200; // 20分钟
    } else if (currentPage.match(/countdown[4-7]\.html/)) {
        totalTime = 900; // 15分钟
    } else if (currentPage.match(/countdown[8-9]\.html/)) {
        totalTime = 300; // 5分钟
    } else if (currentPage === 'countdown10.html') {
        totalTime = 60; // 1分钟
    }

    let timeLeft = totalTime;
    let isDragging = false;
    let countdownInterval;
    let isTimeUp = false;

    // 更新倒计时和进度条
    function updateTimer() {
        const minutes = Math.max(0, Math.floor(timeLeft / 60));
        const seconds = Math.max(0, Math.floor(timeLeft % 60));
        timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // 更新进度条
        const percentage = ((totalTime - timeLeft) / totalTime) * 100;
        progressBar.style.width = `${percentage}%`;
        progressHandle.style.left = `${percentage}%`;
    }

    // 开始倒计时
    function startCountdown() {
        if (countdownInterval) return;
        
        countdownInterval = setInterval(() => {
            timeLeft--;
            updateTimer();

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                alertSound.play();
                isTimeUp = true;
            }
        }, 1000);
    }

    // 停止倒计时
    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    // 拖动进度条
    progressHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        stopCountdown();
        updateProgress(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateProgress(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            startCountdown();
        }
    });

    // 更新进度
    function updateProgress(e) {
        const rect = progressContainer.getBoundingClientRect();
        let percentage = ((e.clientX - rect.left) / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        
        timeLeft = Math.round(totalTime * (1 - percentage / 100));
        updateTimer();
    }

    // 点击进度条直接跳转
    progressContainer.addEventListener('click', (e) => {
        if (!isDragging) {
            updateProgress(e);
            startCountdown();
        }
    });

    // 处理倒计时结束后的点击跳转
    document.addEventListener('click', () => {
        if (isTimeUp) {
            if (currentPage === 'countdown10.html') {
                window.location.href = 'replay.html';
            } else {
                const currentNumber = parseInt(currentPage.match(/\d+/)[0]);
                window.location.href = `countdown${currentNumber + 1}.html`;
            }
        }
    });

    // 添加键盘导航功能
    document.addEventListener('keydown', (e) => {
        const currentNumber = parseInt(currentPage.match(/\d+/)[0]);
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                if (currentNumber === 10) {
                    window.location.href = 'replay.html';
                } else {
                    window.location.href = `countdown${currentNumber + 1}.html`;
                }
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                if (currentNumber === 1) {
                    // 返回规则页面最后一张图片
                    sessionStorage.setItem('returnToLastRule', 'true');
                    window.location.href = 'rule.html';
                } else {
                    window.location.href = `countdown${currentNumber - 1}.html`;
                }
                break;
        }
    });

    // 页面加载时立即更新一次
    updateTimer();
    if (totalTime > 0) {
        startCountdown();
    }
}

// 冥想页面功能
if (window.location.pathname.endsWith('meditation.html')) {
    // 自动全屏
    function enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 播放冥想音乐
    const meditationMusic = document.getElementById('meditationMusic');
    meditationMusic.play().catch(error => console.log('自动播放被阻止:', error));

    // 页面切换功能
    function handleNavigation(direction) {
        // 停止音乐播放
        if (meditationMusic) {
            meditationMusic.pause();
            meditationMusic.currentTime = 0;
        }

        if (direction === 'next') {
            window.location.href = 'rule.html';
        } else if (direction === 'prev') {
            // 返回到index.html并显示最后一张图片
            sessionStorage.setItem('returnToLastImage', 'true');
            window.location.href = 'index.html';
        }
    }

    // 键盘方向键控制（立即生效）
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                handleNavigation('next');
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                handleNavigation('prev');
                break;
        }
    });

    // 音乐播放完成后允许点击跳转
    meditationMusic.addEventListener('ended', () => {
        // 点击跳转到下一页
        document.addEventListener('click', () => handleNavigation('next'));
    });

    // 页面加载完成后自动全屏
    window.addEventListener('load', enterFullscreen);
}

// 规则页面功能
if (window.location.pathname.endsWith('rule.html')) {
    // 自动全屏
    function enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 播放规则背景音乐（从第3秒开始）
    const ruleMusic = document.getElementById('ruleMusic');
    if (ruleMusic) {
        ruleMusic.currentTime = 3; // 设置开始时间为3秒
        ruleMusic.play().catch(error => console.log('自动播放被阻止:', error));
    }

    // 图片切换功能
    const images = document.querySelectorAll('.fullscreen-image');
    let currentImageIndex = 0;
    let isLastImage = false;

    function switchImage(direction = 'next') {
        // 在第一张图片时，向前切换则跳转到冥想页面
        if (currentImageIndex === 0 && direction === 'prev') {
            window.location.href = 'meditation.html';
            return;
        }

        // 在最后一张图片时，向后切换则跳转到倒计时页面
        if (isLastImage && direction === 'next') {
            window.location.href = 'countdown1.html';
            return;
        }

        // 移除当前图片的active类
        images[currentImageIndex].classList.remove('active');
        
        // 更新索引
        if (direction === 'next') {
            currentImageIndex = (currentImageIndex + 1) % images.length;
        } else {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        }
        
        // 添加active类到新图片
        images[currentImageIndex].classList.add('active');

        // 检查是否到达最后一张图片
        isLastImage = currentImageIndex === images.length - 1;
    }

    // 点击切换到下一张
    document.addEventListener('click', () => switchImage('next'));

    // 键盘方向键控制
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                switchImage('next');
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                switchImage('prev');
                break;
        }
    });

    // 检查是否从倒计时页面返回
    if (sessionStorage.getItem('returnToLastRule')) {
        // 清除标记
        sessionStorage.removeItem('returnToLastRule');
        // 直接显示最后一张图片
        const images = document.querySelectorAll('.fullscreen-image');
        images.forEach(img => img.classList.remove('active'));
        images[images.length - 1].classList.add('active');
        currentImageIndex = images.length - 1;
        isLastImage = true;
    }

    // 页面加载完成后自动全屏
    window.addEventListener('load', enterFullscreen);
}

// 回放页面功能
if (window.location.pathname.endsWith('replay.html')) {
    // 播放背景音乐
    const replayMusic = document.getElementById('replayMusic');
    if (replayMusic) {
        replayMusic.play().catch(error => console.log('复盘音乐自动播放被阻止:', error));
    }

    // 图片切换功能
    const images = document.querySelectorAll('.fullscreen-image');
    let currentIndex = 0;

    function switchImage(direction = 'next') {
        // 在第一张图片时，向前切换则返回到countdown10
        if (currentIndex === 0 && direction === 'prev') {
            window.location.href = 'countdown10.html';
            return;
        }

        // 在第二张图片时，向后切换则跳转到视频页面
        if (currentIndex === 1 && direction === 'next') {
            window.location.href = 'video.html';
            return;
        }

        // 在第一张图片时向后切换到第二张
        if (currentIndex === 0 && direction === 'next') {
            images[0].classList.remove('active');
            images[1].classList.add('active');
            currentIndex = 1;
        } 
        // 在第二张图片时向前切换到第一张
        else if (currentIndex === 1 && direction === 'prev') {
            images[1].classList.remove('active');
            images[0].classList.add('active');
            currentIndex = 0;
        }
    }

    // 点击切换到下一张
    document.addEventListener('click', () => switchImage('next'));

    // 键盘方向键控制
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                switchImage('next');
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                switchImage('prev');
                break;
        }
    });

    // 自动全屏
    function enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 页面加载完成后自动全屏
    window.addEventListener('load', enterFullscreen);

    // 检查是否从视频页面返回
    if (sessionStorage.getItem('returnToReplayLast')) {
        // 清除标记
        sessionStorage.removeItem('returnToReplayLast');
        // 直接显示第二张图片
        images.forEach(img => img.classList.remove('active'));
        images[1].classList.add('active');
        currentIndex = 1;
    }
}

// 视频页面功能
if (window.location.pathname.endsWith('video.html')) {
    // 自动全屏
    function enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 键盘导航功能
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                window.location.href = 'end.html';
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                // 返回到replay页面最后一张图片
                sessionStorage.setItem('returnToReplayLast', 'true');
                window.location.href = 'replay.html';
                break;
        }
    });

    // 页面加载完成后自动全屏
    window.addEventListener('load', enterFullscreen);
}

// 结束页面功能
if (window.location.pathname.endsWith('end.html')) {
    // 自动全屏
    function enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 键盘导航功能
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                window.location.href = 'thanks.html';
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                window.location.href = 'video.html';
                break;
        }
    });

    // 点击跳转到感谢页面
    document.addEventListener('click', () => {
        window.location.href = 'thanks.html';
    });

    // 页面加载完成后自动全屏
    window.addEventListener('load', enterFullscreen);
}

// 感谢页面功能
if (window.location.pathname.endsWith('thanks.html')) {
    // 自动全屏
    function enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 键盘导航功能
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                window.location.href = 'end.html';
                break;
        }
    });

    // 页面加载完成后自动全屏
    window.addEventListener('load', enterFullscreen);
} 