document.addEventListener('DOMContentLoaded', () => {
    // Giả sử nút của bạn có id là 'lang-vi' và 'lang-en'
    const langVIButton = document.getElementById('lang-vi');
    const langENButton = document.getElementById('lang-en');

    // Hàm thay đổi ngôn ngữ
    const changeLanguage = (lang) => {
        // Tìm tất cả các phần tử có thuộc tính data-lang-key
        const elementsToTranslate = document.querySelectorAll('[data-lang-key]');

        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-lang-key');
            // Kiểm tra xem key có tồn tại trong file translations không
            if (translations[key] && translations[key][lang]) {
                element.innerHTML = translations[key][lang];
            }
        });

        // Cập nhật giao diện cho nút đang được chọn
        if (lang === 'vi') {
            langVIButton.classList.add('active');
            langENButton.classList.remove('active');
        } else {
            langENButton.classList.add('active');
            langVIButton.classList.remove('active');
        }

        // Lưu lựa chọn ngôn ngữ vào bộ nhớ của trình duyệt
        localStorage.setItem('language', lang);
    };

    // Gắn sự kiện click cho các nút chuyển ngôn ngữ
    langVIButton.addEventListener('click', () => changeLanguage('vi'));
    langENButton.addEventListener('click', () => changeLanguage('en'));

    // Tự động chọn ngôn ngữ đã lưu khi tải lại trang
    const savedLanguage = localStorage.getItem('language') || 'vi'; // Mặc định là Tiếng Việt
    changeLanguage(savedLanguage);
});