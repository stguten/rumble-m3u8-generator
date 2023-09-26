async function enviarParaAPI() {
    const textoParaAPI = document.getElementById('textoParaAPI').value;
    const apiResponseDiv = document.getElementById('apiResponse');

    //Chamada da API
    const respostaDaAPI = await fetch(`/gerar-lista?channel=${textoParaAPI}`).then(response => response.json());

    // Exibindo a div de resposta da API e definindo seu conteúdo
    apiResponseDiv.style.display = 'block';
    apiResponseDiv.innerHTML = `O seu link é: <a href="${respostaDaAPI.link}">Clique aqui</a>`;
}