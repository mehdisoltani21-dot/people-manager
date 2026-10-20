// لیست نفرات (کد + نام کامل)
const peopleList = [
  { id: "7020", name: "Arash Baba" },
  { id: "7021", name: "Daryoush Kazemkhanloo" },
  { id: "7022", name: "Mehdi Afshar Vangini" },
  { id: "7023", name: "Hossein Amandiha" },
  { id: "7065", name: "Alireza Zolghadr" },
  { id: "7071", name: "Rahim Ghalandari" },
  { id: "7083", name: "Mohammad Khalkhali" },
  { id: "7085", name: "Hossein Taghiloo" },
  { id: "7088", name: "Mohsen Mirasheh" },
  { id: "7089", name: "Mohammad Qazvini" },
  { id: "7092", name: "Saeid Rezaei" },
  { id: "7111", name: "Mohammadreza Esmaili" },
  { id: "7118", name: "Alireza Soleymani" },
  { id: "7152", name: "Amin Rastegar" },
  { id: "7154", name: "Keykhosro Gurani" },
  { id: "7196", name: "Hossein Dehghan Nejad" },
  { id: "7197", name: "Esmaeil Alian" },
  { id: "7216", name: "Farzin Shali" },
  { id: "7240", name: "Dariush Hazrati" }
];

// کلید ذخیره‌سازی
const STORAGE_KEY = 'peopleErrorRecords';

// عناصر DOM
const form = document.getElementById('record-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const personSelect = document.getElementById('personSelect');
const workstationInput = document.getElementById('workstation');
const lastNameInput = document.getElementById('lastName');
const errorTypeInput = document.getElementById('errorType');
const recordsBody = document.getElementById('records-body');
const emptyMessage = document.getElementById('empty-message');
const searchInput = document.getElementById('search-input');

let records = [];
let editIndex = null;

// پر کردن لیست انتخاب نفرات
function populatePeopleSelect() {
  peopleList.forEach(person => {
    const option = document.createElement('option');
    option.value = person.id;
    option.textContent = `${person.id} - ${person.name}`;
    option.dataset.name = person.name;
    personSelect.appendChild(option);
  });
}

// وقتی نفر انتخاب شد، نام خانوادگی رو استخراج کن
personSelect.addEventListener('change', () => {
  const selected = personSelect.options[personSelect.selectedIndex];
  if (selected.value) {
    const fullName = selected.dataset.name;
    // آخرین کلمه را به عنوان نام خانوادگی در نظر می‌گیریم
    const parts = fullName.trim().split(' ');
    lastNameInput.value = parts[parts.length - 1] || '';
  } else {
    lastNameInput.value = '';
  }
});

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
      r.personId.includes(search) ||
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
    const realIndex = records.findIndex(r => r.id === record.id);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(record.personId)}</td>
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// افزودن یا ویرایش
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const selectedOption = personSelect.options[personSelect.selectedIndex];
  if (!selectedOption.value) return;

  const newRecord = {
    id: editIndex !== null ? records[editIndex].id : Date.now(),
    personId: selectedOption.value,
    fullName: selectedOption.dataset.name,
    workstation: workstationInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    errorType: errorTypeInput.value.trim()
  };

  if (editIndex !== null) {
    records[editIndex] = newRecord;
  } else {
    records.unshift(newRecord);
  }

  saveRecords();
  renderTable(searchInput.value);
  resetForm();
});

// ویرایش
function editRecord(index) {
  const record = records[index];
  personSelect.value = record.personId;
  workstationInput.value = record.workstation;
  lastNameInput.value = record.lastName;
  errorTypeInput.value = record.errorType;

  editIndex = index;
  formTitle.textContent = 'ویرایش رکورد';
  submitBtn.textContent = 'به‌روزرسانی';
  cancelBtn.style.display = 'inline-block';

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

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  lastNameInput.value = '';
  editIndex = null;
  formTitle.textContent = 'افزودن رکورد جدید';
  submitBtn.textContent = 'ذخیره';
  cancelBtn.style.display = 'none';
}

searchInput.addEventListener('input', () => {
  renderTable(searchInput.value);
});

// شروع
populatePeopleSelect();
loadRecords();
