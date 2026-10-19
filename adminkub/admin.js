
const API_URL = 'https://lovecraft-fysc.onrender.com/api/works';

// Elements
const totalWorks = document.getElementById('totalWorks');
const systemStatus = document.getElementById('systemStatus');
const searchInput = document.getElementById('searchInput');
const message = document.getElementById('message');
const workList = document.getElementById('workList');

// เก็บข้อมูล Work ทั้งหมด
let works = [];

// เริ่มต้นระบบ
document.addEventListener('DOMContentLoaded', () => {
    loadWorks();

    // ค้นหาข้อมูลเมื่อพิมพ์
    searchInput.addEventListener('input', renderWorks);
});

// ดึงข้อมูลจาก Backend
async function loadWorks() {
    message.textContent = 'กำลังโหลดข้อมูล...';
    systemStatus.textContent = 'กำลังเชื่อมต่อ...';

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('รูปแบบข้อมูลที่ได้รับไม่ถูกต้อง');
        }

        works = data;

        systemStatus.textContent = 'เชื่อมต่อแล้ว';
        systemStatus.classList.remove('error');

        renderWorks();
    } catch (error) {
        console.error('โหลดข้อมูลไม่สำเร็จ:', error);

        works = [];
        totalWorks.textContent = '0';
        systemStatus.textContent = 'เชื่อมต่อไม่ได้';
        systemStatus.classList.add('error');

        workList.replaceChildren();
        message.textContent =
            'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ Backend และ MongoDB';
    }
}

// แสดงรายการ Work
function renderWorks() {
    const keyword = searchInput.value.trim().toLowerCase();

    // ค้นหาจาก ID และข้อมูล Work
    const filteredWorks = works.filter((item) => {
        const searchableText = [
            item._id,
            getWorkText(item.work)
        ]
            .join(' ')
            .toLowerCase();

        return searchableText.includes(keyword);
    });

    workList.replaceChildren();
    totalWorks.textContent = works.length;

    if (filteredWorks.length === 0) {
        message.textContent = works.length > 0
            ? 'ไม่พบข้อมูลที่ค้นหา'
            : 'ยังไม่มีข้อมูล Work';

        return;
    }

    message.textContent = `พบ ${filteredWorks.length} รายการ`;

    filteredWorks.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'work-card';

        // หัวข้อรายการ
        const title = document.createElement('h3');
        title.textContent = `Work #${index + 1}`;

        // ID ของข้อมูล
        const id = document.createElement('p');
        id.className = 'work-id';
        id.textContent = `ID: ${item._id || '-'}`;

        // ส่วนแสดงรายละเอียด
        const details = document.createElement('dl');

        const data = parseWork(item.work);

        if (Object.keys(data).length > 0) {
            // แสดงทุกฟิลด์ที่พบโดยไม่กำหนดชื่อไว้ล่วงหน้า
            Object.entries(data).forEach(([key, value]) => {
                const [dt, dd] = createField(key, value);
                details.append(dt, dd);
            });
        } else {
            // กรณีข้อมูลไม่ตรงกับรูปแบบ key: value
            const [dt, dd] = createField(
                'ข้อมูล Work',
                getWorkText(item.work) || '-'
            );

            details.append(dt, dd);
        }

        card.append(title, id, details);
        workList.append(card);
    });
}

// แปลงข้อมูล Work ให้เป็นข้อความสำหรับค้นหา
function getWorkText(work) {
    if (typeof work === 'string') {
        return work;
    }

    if (work !== null && typeof work === 'object') {
        return JSON.stringify(work);
    }

    return work == null ? '' : String(work);
}

// แยกข้อมูลรูปแบบ "ชื่อฟิลด์: ค่า"
function parseWork(work) {
    const result = {};

    if (typeof work !== 'string') {
        return result;
    }

    work.split('\n').forEach((line) => {
        const index = line.indexOf(':');

        // ข้ามบรรทัดที่ไม่มีเครื่องหมาย :
        if (index === -1) {
            return;
        }

        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim();

        if (key) {
            result[key] = value;
        }
    });

    return result;
}

// สร้างช่องแสดงชื่อฟิลด์และค่า
function createField(label, value) {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');

    dt.textContent = label;
    dd.textContent = value == null || value === ''
        ? '-'
        : getWorkText(value);

    return [dt, dd];
}
