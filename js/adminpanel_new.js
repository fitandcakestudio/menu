console.log("VERSION 999");
const supabaseClient = supabase.createClient(
  "https://zjqormxrjvhvbmdfazej.supabase.co",
  "sb_publishable_OLNn50ApEwEeLZQk49u74A_Eue6jUfG"
);

let timeout;
let interval;

// 🇹🇷 TARİH FORMAT (UTC → TR +3 SAAT)
function formatDateTR(dateString) {
  const date = new Date(dateString);

  let hours = date.getUTCHours() + 3;
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  let day = date.getUTCDate();
  let month = date.getUTCMonth() + 1;
  let year = date.getUTCFullYear();

  // gün taşması kontrolü
  if (hours >= 24) {
    hours -= 24;
    day += 1;
  }

  const d = String(day).padStart(2, "0");
  const m = String(month).padStart(2, "0");
  const y = year;

  const h = String(hours).padStart(2, "0");
  const min = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");

  return `${d}/${m}/${y} ${h}:${min}:${s}`;
}

async function addExpense() {
  const amount = document.getElementById("amount").value;
  const desc = document.getElementById("desc").value;
  const type = document.getElementById("type").value;

  const { data: userData } = await supabaseClient.auth.getUser();
  const email = userData.user.email;

  document.getElementById("undo").innerHTML =
    "Kaydediliyor... <button onclick='cancel()'>Undo</button>";

  const progressContainer = document.getElementById("progress-container");
  const progressBar = document.getElementById("progress-bar");

  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  let time = 0;
  const duration = 5000;

  interval = setInterval(() => {
    time += 100;
    progressBar.style.width = (time / duration) * 100 + "%";
  }, 100);

  timeout = setTimeout(() => {
    clearInterval(interval);
    saveToDB(amount, desc, type, email);
  }, duration);
}

function cancel() {
  clearTimeout(timeout);
  clearInterval(interval);
  document.getElementById("undo").innerHTML = "İptal edildi";
  document.getElementById("progress-container").style.display = "none";
}

async function saveToDB(amount, desc, type, email) {
  const { error } = await supabaseClient
    .from("expenses")
    .insert([{ amount, description: desc, type, user_email: email }]);

  if (error) {
    alert("Hata: " + error.message);
    return;
  }

  document.getElementById("undo").innerHTML = "Kaydedildi";
  document.getElementById("progress-container").style.display = "none";

  loadExpenses();
}

async function loadExpenses() {
  const { data, error } = await supabaseClient
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const incomeBody = document.querySelector("#income-table tbody");
  const expenseBody = document.querySelector("#expense-table tbody");

  incomeBody.innerHTML = "";
  expenseBody.innerHTML = "";

  let incomeTotal = 0;
  let expenseTotal = 0;

  data.forEach(e => {
    const row = `
      <tr>
        <td>${e.amount} ₺</td>
        <td>${e.description}</td>
        <td>${formatDateTR(e.created_at)}</td>
        <td>${e.user_email}</td>
      </tr>
    `;

    if (e.type === "income") {
      incomeBody.innerHTML += row;
      incomeTotal += Number(e.amount);
    } else {
      expenseBody.innerHTML += row;
      expenseTotal += Number(e.amount);
    }
  });

  document.getElementById("income-total").innerText =
    "Toplam Gelir: " + incomeTotal + " ₺";

  document.getElementById("expense-total").innerText =
    "Toplam Gider: " + expenseTotal + " ₺";
}

loadExpenses();