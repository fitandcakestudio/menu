<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Admin Panel</title>
</head>

<body>

<h2>Gider Ekle</h2>

<input type="number" id="amount" placeholder="Tutar"><br><br>
<input type="text" id="desc" placeholder="Açıklama"><br><br>

<button onclick="addExpense()">Kaydet</button>

<div id="undo"></div>

<!-- PROGRESS BAR -->
<div id="progress-container" style="width:100%; height:6px; background:#eee; margin-top:10px; display:none;">
  <div id="progress-bar" style="width:0%; height:100%; background:#4caf50;"></div>
</div>

<h3>Kayıtlar</h3>
<ul id="list"></ul>

<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
const supabaseClient = supabase.createClient(
  "https://zjqormxrjvhvbmdfazej.supabase.co",
  "sb_publishable_OLNn50ApEwEeLZQk49u74A_Eue6jUfG"
);

let timeout;
let interval;

function addExpense() {
  const amount = document.getElementById("amount").value;
  const desc = document.getElementById("desc").value;

  document.getElementById("undo").innerHTML =
    "Kaydediliyor... <button onclick='cancel()'>Undo</button>";

  const progressContainer = document.getElementById("progress-container");
  const progressBar = document.getElementById("progress-bar");

  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  progressBar.style.background = "#4caf50";

  let time = 0;
  const duration = 10000;
  const step = 100;

  interval = setInterval(() => {
    time += step;
    const percent = (time / duration) * 100;
    progressBar.style.width = percent + "%";

    // renk değişimi
    if (percent > 70) {
      progressBar.style.background = "#ff9800";
    }
    if (percent > 90) {
      progressBar.style.background = "#f44336";
    }
  }, step);

  timeout = setTimeout(() => {
    clearInterval(interval);
    progressBar.style.width = "100%";
    saveToDB(amount, desc);
  }, duration);
}

function cancel() {
  clearTimeout(timeout);
  clearInterval(interval);

  document.getElementById("undo").innerHTML = "İptal edildi";
  document.getElementById("progress-container").style.display = "none";
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
  document.getElementById("progress-container").style.display = "none";

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
</script>

</body>
</html>