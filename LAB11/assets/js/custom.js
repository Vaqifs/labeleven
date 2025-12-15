document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");

  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const address = document.getElementById("address");

  const rating1 = document.getElementById("rating1");
  const rating2 = document.getElementById("rating2");
  const rating3 = document.getElementById("rating3");

  const r1Value = document.getElementById("r1Value");
  const r2Value = document.getElementById("r2Value");
  const r3Value = document.getElementById("r3Value");

  const results = document.getElementById("formResults");
  const popup = document.getElementById("successPopup");

  // ---------- helpers ----------
  const setError = (inputEl, errId, msg) => {
    const errEl = document.getElementById(errId);
    if (msg) {
      inputEl.classList.add("is-invalid");
      if (errEl) errEl.textContent = msg;
      return false;
    }
    inputEl.classList.remove("is-invalid");
    if (errEl) errEl.textContent = "";
    return true;
  };

  const onlyLetters = (s) => /^[A-Za-zÀ-ž\s'-]+$/.test(s.trim());
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

  // Lithuania format: +370 6XX XXXXX
  function formatLTPhone(raw) {
    // keep digits only
    const digits = raw.replace(/\D/g, "");

    // allow starting with 370 or 6...
    let d = digits;
    if (d.startsWith("370")) d = d.slice(3);

    // we expect 8 digits after country code (6xxxxxxxx)
    // start must be 6
    if (d.length > 8) d = d.slice(0, 8);

    // build formatted
    // +370 6XX XXXXX
    let out = "+370 ";
    if (d.length === 0) return out;

    // first digit (should be 6)
    out += d.slice(0, 1);

    if (d.length > 1) out += d.slice(1, 3).padEnd(2, "");
    if (d.length > 3) out += " " + d.slice(3, 8);

    return out;
  }

  function showPopup() {
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 2500);
  }

  function colorAverage(avg) {
    const avgEl = document.getElementById("avgValue");
    if (!avgEl) return;

    avgEl.classList.remove("avg-red", "avg-orange", "avg-green");

    if (avg < 4) avgEl.classList.add("avg-red");
    else if (avg < 7) avgEl.classList.add("avg-orange");
    else avgEl.classList.add("avg-green");
  }

  // ---------- slider live values ----------
  const syncRatings = () => {
    r1Value.textContent = rating1.value;
    r2Value.textContent = rating2.value;
    r3Value.textContent = rating3.value;
  };

  syncRatings();
  [rating1, rating2, rating3].forEach(r => r.addEventListener("input", syncRatings));

  // ---------- realtime validation (optional task included) ----------
  function validateFirstName() {
    const v = firstName.value.trim();
    if (!v) return setError(firstName, "err-firstName", "Name is required");
    if (!onlyLetters(v)) return setError(firstName, "err-firstName", "Only letters allowed");
    return setError(firstName, "err-firstName", "");
  }

  function validateLastName() {
    const v = lastName.value.trim();
    if (!v) return setError(lastName, "err-lastName", "Surname is required");
    if (!onlyLetters(v)) return setError(lastName, "err-lastName", "Only letters allowed");
    return setError(lastName, "err-lastName", "");
  }

  function validateEmail() {
    const v = email.value.trim();
    if (!v) return setError(email, "err-email", "Email is required");
    if (!isEmail(v)) return setError(email, "err-email", "Invalid email format");
    return setError(email, "err-email", "");
  }

  function validatePhone() {
    const v = phone.value.trim();
    // Must match: +370 6XX XXXXX
    const ok = /^\+370\s6\d{2}\s\d{5}$/.test(v);
    if (!v) return setError(phone, "err-phone", "Phone is required");
    if (!ok) return setError(phone, "err-phone", "Format: +370 6XX XXXXX");
    return setError(phone, "err-phone", "");
  }

  function validateAddress() {
    const v = address.value.trim();
    if (!v) return setError(address, "err-address", "Address is required");
    if (v.length < 5) return setError(address, "err-address", "Address is too short");
    return setError(address, "err-address", "");
  }

  function validateAll() {
    const a = validateFirstName();
    const b = validateLastName();
    const c = validateEmail();
    const d = validatePhone();
    const e = validateAddress();

    const allOk = a && b && c && d && e;
    submitBtn.disabled = !allOk;
    return allOk;
  }

  firstName.addEventListener("input", () => { validateFirstName(); validateAll(); });
  lastName.addEventListener("input", () => { validateLastName(); validateAll(); });
  email.addEventListener("input", () => { validateEmail(); validateAll(); });

  // phone masking + validation
  phone.addEventListener("input", () => {
    phone.value = formatLTPhone(phone.value);
    validatePhone();
    validateAll();
  });

  address.addEventListener("input", () => { validateAddress(); validateAll(); });

  // run once at start
  phone.value = "+370 ";
  validateAll();

  // ---------- submit ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateAll()) return; // popup only if valid

    const r1 = Number(rating1.value);
    const r2 = Number(rating2.value);
    const r3 = Number(rating3.value);

    const avg = Number(((r1 + r2 + r3) / 3).toFixed(1));

    const data = {
      name: firstName.value.trim(),
      surname: lastName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      address: address.value.trim(),
      rating1: r1,
      rating2: r2,
      rating3: r3,
      average: avg
    };

    console.log(data);

    results.style.display = "block";
    results.innerHTML = `
      <p>Name: ${data.name}</p>
      <p>Surname: ${data.surname}</p>
      <p>Email: ${data.email}</p>
      <p>Phone number: ${data.phone}</p>
      <p>Address: ${data.address}</p>
      <p class="avg-line">${data.name} ${data.surname}: <span id="avgValue">${data.average}</span></p>
    `;

    colorAverage(avg);
    showPopup();
  });
});
