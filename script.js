// کلید ذخیره‌سازی
const STORAGE_KEY = 'peopleErrorRecords';

// عناصر DOM
const form = document.getElementById('record-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const fullNameInput = document.getElementById('fullName');
const workstationInput = document.getElementById('workstation');
const lastNameInput = document.getElementById('lastName');
const errorTypeInput = document.getElementById('errorType');
const recordsBody = document.getElementById('records-body');
const emptyMessage = document.getElementById('empty-message');
const searchInput = document.getElementById('search-input');

let records = [];
let editIndex = null;

// بارگذاری از localStorage
function loadRecords() {
  const data = localStorage.getItem(STORAGE_KEY);
  records = data ? JSON.parse(data) : [];
  renderTable();
}

// ذخیره در localStorage
function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// رندر جدول
function renderTable(filter = '') {
  const filtered = records.filter(r => {
    const search = filter.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(search) ||
      r.workstation.toLowerCase().includes(search) ||
      r.lastName.toLowerCase().includes(search) ||
      r.errorType.toLowerCase().includes(search)
    );
  });

  recordsBody.innerHTML = '';

  if (filtered.length === 0) {
    emptyMessage.classList.add('show');
    emptyMessage.textContent = filter ? 'نتیجه‌ای یافت نشد.' : 'هنوز هیچ رکوردی ثبت نشده است.';
    return;
  }

  emptyMessage.classList.remove('show');

  filtered.forEach((record, index) => {
    // پیدا کردن ایندکس واقعی در آرایه اصلی
    const realIndex = records.findIndex(r => r.id === record.id);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(record.fullName)}</td>
      <td>${escapeHtml(record.workstation)}</td>
      <td>${escapeHtml(record.lastName)}</td>
      <td>${escapeHtml(record.errorType)}</td>
      <td class="actions">
        <button class="btn-edit" onclick="editRecord(${realIndex})">ویرایش</button>
        <button class="btn-delete" onclick="deleteRecord(${realIndex})">حذف</button>
      </td>
    `;
    recordsBody.appendChild(tr);
  });
}

// جلوگیری از XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// افزودن یا ویرایش
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const newRecord = {
    id: editIndex !== null ? records[editIndex].id : Date.now(),
    fullName: fullNameInput.value.trim(),
    workstation: workstationInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    errorType: errorTypeInput.value.trim()
  };

  if (editIndex !== null) {
    records[editIndex] = newRecord;
  } else {
    records.unshift(newRecord); // جدیدترین بالا
  }

  saveRecords();
  renderTable(searchInput.value);
  resetForm();
});

// ویرایش
function editRecord(index) {
  const record = records[index];
  fullNameInput.value = record.fullName;
  workstationInput.value = record.workstation;
  lastNameInput.value = record.lastName;
  errorTypeInput.value = record.errorType;

  editIndex = index;
  formTitle.textContent = 'ویرایش رکورد';
  submitBtn.textContent = 'به‌روزرسانی';
  cancelBtn.style.display = 'inline-block';

  // اسکرول به فرم
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// حذف
function deleteRecord(index) {
  if (confirm('آیا مطمئن هستید که می‌خواهید این رکورد را حذف کنید؟')) {
    records.splice(index, 1);
    saveRecords();
    renderTable(searchInput.value);
    if (editIndex === index) resetForm();
  }
}

// انصراف از ویرایش
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  editIndex = null;
  formTitle.textContent = 'افزودن رکورد جدید';
  submitBtn.textContent = 'ذخیره';
  cancelBtn.style.display = 'none';
}

// جستجو زنده
searchInput.addEventListener('input', () => {
  renderTable(searchInput.value);
});

// شروع
loadRecords();
