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

// فهرست ایستگاه‌های کاری
const workstations = [
  "ورودی",
  "روکش زیرین",
  "سنباده پنل",
  "روکش فوقانی",
  "اوستا باشی پنل",
  "اوستاباشی پروفیل",
  "گزارشگیر",
  "بسته بندی پنل",
  "برش فویل",
  "روکش پروفیل",
  "سنباده پروفیل",
  "فرزه",
  "سلکو",
  "پالت سازی"
];

const STORAGE_KEY = "peopleErrorRecords";

// عناصر صفحه
const form = document.getElementById("record-form");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const personSelect = document.getElementById("personSelect");
const workstationSelect = document.getElementById("workstation");
const errorTypeInput = document.getElementById("errorType");
const recordsBody = document.getElementById("records-body");
const emptyMessage = document.getElementById("empty-message");
const searchInput = document.getElementById("search-input");

let records = [];
let editIndex = null;

// پر کردن فهرست نفرات
function populatePeopleSelect() {
  peopleList.forEach(person => {
    const option = document.createElement("option");
    option.value = person.id;
    option.textContent = `${person.id} - ${person.name}`;
    option.dataset.name = person.name;
    personSelect.appendChild(option);
  });
}

// پر کردن فهرست ایستگاه‌های کاری
function populateWorkstations() {
  workstationSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "-- انتخاب ایستگاه کاری --";
  workstationSelect.appendChild(placeholder);

  workstations.forEach(workstation => {
    const option = document.createElement("option");
    option.value = workstation;
    option.textContent = workstation;
    workstationSelect.appendChild(option);
  });
}

// بارگذاری اطلاعات قبلی
function loadRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    records = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("خطا در بارگذاری اطلاعات:", error);
    records = [];
    alert("خواندن اطلاعات ذخیره‌شده با خطا مواجه شد.");
  }

  // سازگاری با رکوردهای قبلی
  records = records.map(record => ({
    ...record,
    id: record.id ?? Date.now() + Math.random(),
    personId: String(record.personId ?? ""),
    fullName: record.fullName ?? "",
    workstation: record.workstation ?? "",
    errorType: record.errorType ?? ""
  }));

  renderTable();
}

// ذخیره اطلاعات
function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error("خطا در ذخیره اطلاعات:", error);
    alert("ذخیره اطلاعات انجام نشد. فضای ذخیره‌سازی مرورگر را بررسی کنید.");
    return false;
  }
}

// نمایش جدول
function renderTable(filter = "") {
  const search = filter.trim().toLowerCase();

  const filtered = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => {
      return [
        record.personId,
        record.fullName,
        record.workstation,
        record.errorType
      ].some(value =>
        String(value ?? "").toLowerCase().includes(search)
      );
    });

  recordsBody.innerHTML = "";

  if (filtered.length === 0) {
    emptyMessage.classList.add("show");
    emptyMessage.textContent = search
      ? "نتیجه‌ای یافت نشد."
      : "هنوز هیچ رکوردی ثبت نشده است.";
    return;
  }

  emptyMessage.classList.remove("show");

  filtered.forEach(({ record, index }, rowIndex) => {
    const tr = document.createElement("tr");

    const values = [
      rowIndex + 1,
      record.personId,
      record.fullName,
      record.workstation,
      record.errorType
    ];

    values.forEach(value => {
      const td = document.createElement("td");
      td.textContent = String(value ?? "");
      tr.appendChild(td);
    });

    const actions = document.createElement("td");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn-edit";
    editButton.textContent = "ویرایش";
    editButton.addEventListener("click", () => editRecord(index));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn-delete";
    deleteButton.textContent = "حذف";
    deleteButton.addEventListener("click", () => deleteRecord(index));

    actions.append(editButton, deleteButton);
    tr.appendChild(actions);
    recordsBody.appendChild(tr);
  });
}

// افزودن یا ویرایش رکورد
form.addEventListener("submit", event => {
  event.preventDefault();

  const selectedOption = personSelect.options[personSelect.selectedIndex];

  if (!selectedOption || !selectedOption.value) {
    alert("لطفاً نام نفر را انتخاب کنید.");
    return;
  }

  if (!workstationSelect.value) {
    alert("لطفاً ایستگاه کاری را انتخاب کنید.");
    return;
  }

  const newRecord = {
    id: editIndex !== null ? records[editIndex].id : Date.now(),
    personId: selectedOption.value,
    fullName: selectedOption.dataset.name,
    workstation: workstationSelect.value,
    errorType: errorTypeInput.value.trim()
  };

  if (!newRecord.errorType) {
    alert("لطفاً نوع خطا را وارد کنید.");
    return;
  }

  const previousRecord = editIndex !== null ? records[editIndex] : null;

  if (editIndex !== null) {
    records[editIndex] = newRecord;
  } else {
    records.unshift(newRecord);
  }

  if (!saveRecords()) {
    if (editIndex !== null) {
      records[editIndex] = previousRecord;
    } else {
      records.shift();
    }
    return;
  }

  renderTable(searchInput.value);
  resetForm();
});

// ویرایش رکورد
function editRecord(index) {
  const record = records[index];
  if (!record) return;

  personSelect.value = record.personId;

  // پشتیبانی از ایستگاه‌های قدیمی که دیگر در فهرست نیستند
  const knownWorkstation = workstations.includes(record.workstation);

  if (!knownWorkstation && record.workstation) {
    const option = document.createElement("option");
    option.value = record.workstation;
    option.textContent = record.workstation + " (رکورد قبلی)";
    workstationSelect.appendChild(option);
  }

  workstationSelect.value = record.workstation;
  errorTypeInput.value = record.errorType;

  editIndex = index;
  formTitle.textContent = "ویرایش رکورد";
  submitBtn.textContent = "به‌روزرسانی";
  cancelBtn.style.display = "inline-block";

  document.querySelector(".form-section").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// حذف رکورد
function deleteRecord(index) {
  if (!records[index]) return;

  if (confirm("آیا مطمئن هستید که می‌خواهید این رکورد را حذف کنید؟")) {
    const deletedRecord = records[index];
    records.splice(index, 1);

    if (!saveRecords()) {
      records.splice(index, 0, deletedRecord);
      return;
    }

    renderTable(searchInput.value);

    if (editIndex === index) {
      resetForm();
    } else if (editIndex !== null && editIndex > index) {
      editIndex--;
    }
  }
}

// انصراف از ویرایش
cancelBtn.addEventListener("click", resetForm);

// پاک کردن فرم
function resetForm() {
  form.reset();
  editIndex = null;
  formTitle.textContent = "افزودن رکورد جدید";
  submitBtn.textContent = "ذخیره";
  cancelBtn.style.display = "none";

  // حذف گزینه موقت مربوط به ایستگاه قدیمی
  Array.from(workstationSelect.options).forEach(option => {
    if (option.textContent.endsWith(" (رکورد قبلی)")) {
      option.remove();
    }
  });

  workstationSelect.value = "";
}

// جست‌وجو
searchInput.addEventListener("input", () => {
  renderTable(searchInput.value);
});

// راه‌اندازی صفحه
populatePeopleSelect();
populateWorkstations();
loadRecords();
