
document.addEventListener('DOMContentLoaded', function () {
    let vocabularyData = [];
    let filteredData = [];
    let currentWeek = 0;
    let currentDay = 0;
    let currentPage = 1;
    let itemsPerPage = 10;
    let totalPages = 1;

    const weekSelector = document.getElementById('weekSelector');
    const daySelector = document.getElementById('daySelector');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const searchInput = document.getElementById('searchInput');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const errorMessage = document.getElementById('errorMessage');
    const burger = document.getElementById('burger');
    const navLinks = document.querySelector('.nav-links');

    const popupModal = document.getElementById("popupModal");
    const popupText = document.getElementById("popupText");
    const closeBtn = document.querySelector(".close-btn");

    initEventListeners();
    setupColumnToggles();
    loadVocabularyData();

    async function loadVocabularyData() {
        try {
            errorMessage.style.display = 'none';
            const filename = `data/kotoba-minggu${currentWeek}-halaman${currentDay}.json`;
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Data tidak ditemukan untuk Minggu ${currentWeek} Hari ${currentDay}`);
            }

            vocabularyData = await response.json();
            filteredData = [...vocabularyData];
            searchInput.value = '';
            currentPage = 1;
            updatePagination();
            renderTable();
        } catch (error) {
            console.error("Error:", error);
            showError(error.message);
        }
    }

    function renderTable() {
        const tbody = document.querySelector('#vocabularyTable tbody');
        tbody.innerHTML = '';

        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">Tidak ada data</td></tr>';
            return;
        }

        const paginatedData = getPaginatedData();
        paginatedData.forEach((item, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
            const row = document.createElement('tr');
            row.innerHTML = `
    <td>${item.kotoba || '-'}</td>
    <td>${item.kana || '-'}</td>
    <td>${item.arti || '-'}</td>
    <td>
        <i class="fas fa-info-circle info-btn" title="Lihat contoh" data-contoh="${item.contoh || ''}"></i>
    </td>
    <td>
        <i class="fas fa-eye action-btn" title="Sembunyikan kolom baris ini"></i>
    </td>
`;
            tbody.appendChild(row);

            // Event listener untuk tombol blur
            row.querySelector('.action-btn').addEventListener('click', (e) => {
                const targetRow = e.target.closest('tr');
                const cells = targetRow.querySelectorAll('td');
                [0, 1, 2].forEach(i => cells[i].classList.toggle('blurred'));
                e.target.classList.toggle('fa-eye');
                e.target.classList.toggle('fa-eye-slash');
            });

            // Event listener untuk tombol info
            row.querySelector('.info-btn').addEventListener('click', (e) => {
                const contohKalimat = e.target.dataset.contoh;
                showPopup(contohKalimat || "Belum ada contoh kalimat.");
            });
        });
    }

    function getPaginatedData() {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }

    function updatePagination() {
        totalPages = Math.ceil(filteredData.length / itemsPerPage);
        pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    function filterData(keyword) {
        if (!keyword) {
            filteredData = [...vocabularyData];
        } else {
            const lowerKeyword = keyword.toLowerCase();
            filteredData = vocabularyData.filter(item =>
                (item.kotoba && item.kotoba.toLowerCase().includes(lowerKeyword)) ||
                (item.kana && item.kana.toLowerCase().includes(lowerKeyword))
            );
        }

        currentPage = 1;
        updatePagination();
        renderTable();
    }

    function setupColumnToggles() {
        document.querySelectorAll('.column-toggle').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const column = e.target.dataset.column;
                const columnIndex = getColumnIndex(column);

                document.querySelectorAll(`tbody td:nth-child(${columnIndex})`).forEach(cell => {
                    cell.classList.toggle('blurred');
                });

                e.target.classList.toggle('fa-eye');
                e.target.classList.toggle('fa-eye-slash');
            });
        });
    }

    function getColumnIndex(columnName) {
        const columns = {
            'kotoba': 1,
            'kana': 2,
            'arti': 3
        };
        return columns[columnName] || 0;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        document.querySelector('#vocabularyTable tbody').innerHTML = '';
    }

    function showPopup(text) {
    popupText.innerHTML = formatInfo(text); // pakai innerHTML agar HTML dirender
    popupModal.style.display = "block";
}

    function formatInfo(text) {
    // Ubah **teks** menjadi <strong>teks</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Ubah \n menjadi <br> untuk baris baru
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

    closeBtn.addEventListener("click", () => {
        popupModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === popupModal) {
            popupModal.style.display = "none";
        }
    });

    function initEventListeners() {
        weekSelector.addEventListener('change', () => {
            currentWeek = parseInt(weekSelector.value);
            currentDay = 1;
            daySelector.value = 1;
            loadVocabularyData();
        });

        daySelector.addEventListener('change', () => {
            currentDay = parseInt(daySelector.value);
            loadVocabularyData();
        });

        itemsPerPageSelect.addEventListener('change', () => {
            itemsPerPage = parseInt(itemsPerPageSelect.value);
            currentPage = 1;
            updatePagination();
            renderTable();
        });

        searchInput.addEventListener('input', (e) => {
            filterData(e.target.value);
        });

        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updatePagination();
                renderTable();
            }
        });

        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updatePagination();
                renderTable();
            }
        });

        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            burger.classList.toggle('active');
        });
    }
});
