"strict mode";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://wcskddmelsobazehyceo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjc2tkZG1lbHNvYmF6ZWh5Y2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAwNzYwODYsImV4cCI6MjAyNTY1MjA4Nn0.nhKExJF1NuEQjyJnkWyc9mKYaaZR7dqOUQlyfvUGr2Q";
export const supabase = createClient(supabaseUrl, supabaseKey);

const registerForm = document.querySelector(`.registerForm`);
const loginForm = document.querySelector(`.loginForm`);
const errorEl = document.querySelector(".error");

if (window.location.pathname === "/login.html") {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;
    const passwordInput = document.getElementById("passwordInput").value; // Access the input element

    try {
      // Manually check credentials against your database
      const { data, error } = await supabase
        .from("players")
        .select("userHash, nick") // Retrieve both userHash and nick
        .eq("email", email)
        .eq("password", passwordInput);

      if (error) {
        console.error("Blad logowania:", error.message);
        errorEl.innerHTML = `${error}`;
        return;
      }

      if (data && data.length > 0) {
        // If user exists and password matches
        console.log("Zalogowano pomyślnie:", data[0]);
        // Set user data in cookies or session
        document.cookie = `userHash=${data[0].userHash}; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/`;
        // Redirect to index.html after successful login
        window.location.href = "index.html";
        // Set nick in the input field
      } else {
        console.error("Blad logowania: Niepoprawny email lub haslo");
        errorEl.innerHTML = "Niepoprawny email lub haslo";
      }
    } catch (error) {
      errorEl.innerHTML = `${error}`;
      console.error("Blad w logowaniu:", error.message);
    }
  });
}
if (window.location.pathname === "/register.html") {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let nick = document.getElementById("nickInput").value;
    let email = document.getElementById("emailInput").value;
    let password = document.getElementById("passwordInput").value; // Access the input element

    try {
      const { data: userExistsDataNick, error: userExistsErrorNick } =
        await supabase.from("players").select("id").eq("nick", nick).single();

      const { data: userExistsDataEmail, error: userExistsErrorEmail } =
        await supabase.from("players").select("id").eq("email", email).single();

      if (userExistsDataNick || userExistsDataEmail) {
        // Jeśli użytkownik o podanym nicku lub adresie e-mail już istnieje, wyświetl błąd
        console.error(
          "Użytkownik o podanym nicku lub adresie e-mail już istnieje."
        );
        errorEl.innerHTML =
          "Użytkownik o podanym nicku lub adresie e-mail już istnieje.";
        return;
      }

      // Jeśli użytkownik o podanym nicku lub adresie e-mail nie istnieje, dodaj nowego użytkownika
      const { data, error } = await supabase.from("players").insert([
        {
          nick: nick,
          email: email,
          password: password,
          role: "player",
          color: [],
        },
      ]);

      if (error) {
        console.error("Błąd w procesie rejestracji:", error.message);
        errorEl.innerHTML = `${error}`;
        return;
      }

      // Po pomyślnym dodaniu
      if (data) {
        window.location.href = "login.html";
        console.log("Zarejestrowano pomyślnie:", data.user);
      }
    } catch (error) {
      errorEl.innerHTML = `${error}`;
      console.error("Błąd w rejestracji:", error.message);
    }
  });
}
