const supabaseClient = supabase.createClient(
  "https://zjqormxrjvhvbmdfazej.supabase.co",
  "sb_publishable_OLNn50ApEwEeLZQk49u74A_Eue6jUfG"
);

let timeout;
let interval;

// ✅ DOĞRU TIMEZONE
/*
function formatDateTR(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
*/

// ✅ EKLEME
async function addExpense() {
  const amount = document.getElementById("amount").value;
  const desc = document.getElementById("desc").value;
  const type = document.getElementById("type").value;

  // 🔥 SESSION CHECK
  const { data: userData, error: userError } =
    await supabaseClient.auth.getUser();

  if (userError || !userData?.user) {
    alert("Session yok. Tekrar login ol.");
    return;
  }

  const email = userData.user.email;

  document.getElementById("undo").innerHTML =
    "Kaydediliyor... <button onclick='cancel()'>Undo</button>";

  const progressContainer = document.getElementById("progress-container");
  const progressBar = document.getElementById("progress-bar");

  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  let time = 0;
  const duration = 3000;

  interval = setInterval(() => {
    time += 100;
    progressBar.style.width = (time / duration) * 100 + "%";
  }, 100);

  timeout = setTimeout(() => {
    clearInterval(interval);
    saveToDB(amount, desc, type, email);
  }, duration);
}

// ✅ CANCEL
function cancel() {
  clearTimeout(timeout);
  clearInterval(interval);
  document.getElementById("undo").innerHTML = "İptal edildi";
  document.getElementById("progress-container").style.display = "none";
}

// ✅ DB KAYIT
async function saveToDB(amount, desc, type, email) {
  console.log("SAVE ÇALIŞTI");

  const { data, error } = await supabaseClient
    .from("expenses")
    .insert([{ amount, description: desc, type, user_email: email }])
    .select();

  if (error) {
    console.error(error);
    alert("Hata: " + error.message);
    return;
  }

  console.log("INSERT OK:", data);

  document.getElementById("undo").innerHTML = "Kaydedildi";
  document.getElementById("progress-container").style.display = "none";

  loadExpenses();
}

// ✅ TABLO LOAD
async function loadExpenses() {
  console.log("LOAD ÇALIŞTI");

  const { data, error } = await supabaseClient
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("LOAD ERROR:", error);
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
        <td>${new Date(e.created_at).toLocaleString("tr-TR", {
          timeZone: "Europe/Istanbul"
        })}</td>
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