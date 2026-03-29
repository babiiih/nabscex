async function generateImage() {
  const prompt = document.getElementById("prompt").value;
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "<p>Generating...</p>";

  try {
    // ⚠️ JANGAN taruh API key asli di sini
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "sk-J5emVIn1vkjWfIXTvTiHGnmgbeK9STUm3nmFdhGAGKoTDSUe"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1792"
      })
    });

    const data = await response.json();

    const imageUrl = data.data[0].url;

    resultDiv.innerHTML = `<img src="${imageUrl}" />`;

  } catch (error) {
    resultDiv.innerHTML = "<p>Error generating image</p>";
    console.error(error);
  }
}