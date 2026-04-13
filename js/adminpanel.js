const supabaseClient = supabase.createClient(
  "https://zjqormxrjvhvbmdfazej.supabase.co",
  "sb_publishable_OLNn50ApEwEeLZQk49u74A_Eue6jUfG"
);

let timeout;

function addExpense() {
  const amount = document.getElementById("amount").value;
  const desc = document.getElementById("desc").value;

  document.getElementById("undo").innerHTML =
    "Kaydediliyor... <button onclick='cancel()'>Undo</button>";

  timeout = setTimeout(() => saveToDB(amount, desc), 5000);
}

function cancel() {
  clearTimeout(timeout);
  document.getElementById("undo").innerHTML = "İptal edildi";
}

async function saveToDB(amount, desc) {
  const { data, error } = await supabaseClient
    .from("expenses")
    .insert([{ amount, description: desc }]);

  if (error) {
    alert("Hata: " + error.message);
    return;
  }

  document.getElementById("undo").innerHTML = "Kaydedildi";
  loadExpenses();
}

async function loadExpenses() {
  const { data } = await supabaseClient
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(e => {
    const li = document.createElement("li");
    li.innerText = `${e.amount} ₺ - ${e.description} (${e.created_at})`;
    list.appendChild(li);
  });
}

loadExpenses();