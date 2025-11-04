document.getElementById("userForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  try {
    const response = await fetch("http://127.0.0.1:5000/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Request failed');
    }

    const result = await response.json();
    document.getElementById("responseMsg").textContent = result.message;
  } catch (err) {
    document.getElementById("responseMsg").textContent = 'Error: ' + err.message;
  }
});
