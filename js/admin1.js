const supabaseClient = supabase.createClient(
  "https://zjqormxrjvhvbmdfazej.supabase.co",
  "sb_publishable_OLNn50ApEwEeLZQk49u74A_Eue6jUfG"
);

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log(error);
    document.getElementById("error").innerText = error.message;
  } else {
    window.location.href = "adminpanel1.html";
  }
}
