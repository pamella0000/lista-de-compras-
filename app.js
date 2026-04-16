const precosMedios = {
    arroz: 25.9, feijao: 8.5, macarrao: 5.9,
    leite: 5.5, cafe: 12.9, carne: 45.9,
    banana: 5.9, maca: 8.9, tomate: 6.9
};

let listaDeCompras = [];

// ==========================
// AUTOCOMPLETE
// ==========================
function sugerirProdutos(texto) {
    if (!texto || texto.length < 2) return [];

    const textoLower = texto.toLowerCase();

    return Object.entries(precosMedios)
        .filter(([nome]) => nome.includes(textoLower))
        .slice(0, 5)
        .map(([nome, preco]) => ({ nome, preco }));
}

function configurarAutocomplete() {
    const input = document.getElementById('item');
    const sugestoesDiv = document.getElementById('sugestoesList');

    let timeout;

    input.addEventListener('input', (e) => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            const texto = e.target.value.trim();
            const sugestoes = sugerirProdutos(texto);

            if (sugestoes.length > 0) {
                sugestoesDiv.innerHTML = sugestoes.map(sug => `
                    <div class="sugestao-item" data-nome="${sug.nome}" data-preco="${sug.preco}">
                        ${sug.nome} - R$ ${sug.preco.toFixed(2)}
                    </div>
                `).join('');

                sugestoesDiv.hidden = false;

                document.querySelectorAll('.sugestao-item').forEach(item => {
                    item.addEventListener('click', () => {
                        input.value = item.dataset.nome;
                        document.getElementById('preco').value = parseFloat(item.dataset.preco);
                        sugestoesDiv.hidden = true;
                    });
                });

            } else {
                sugestoesDiv.hidden = true;
            }
        }, 300);
    });

    // clicar fora fecha
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-wrapper')) {
            sugestoesDiv.hidden = true;
        }
    });
}

// ==========================
// ADICIONAR ITEM
// ==========================
function adicionarItem() {
    const nome = document.getElementById('item').value.trim();
    let preco = parseFloat(document.getElementById('preco').value);
    let quantidade = parseInt(document.getElementById('quantidade').value);

    if (!nome) return alert("Digite um item");

    if (isNaN(quantidade) || quantidade < 1) quantidade = 1;

    if (isNaN(preco)) preco = 0;

    const item = {
        id: Date.now(),
        nome,
        preco,
        quantidade,
        comprado: false
    };

    listaDeCompras.push(item);

    limparInputs();
    renderizarLista();
}

// ==========================
// RENDER
// ==========================
function renderizarLista() {
    const lista = document.getElementById('lista');

    if (listaDeCompras.length === 0) {
        lista.innerHTML = "<li>Lista vazia</li>";
        atualizarTotal();
        return;
    }

    lista.innerHTML = listaDeCompras.map(item => `
        <li>
            <input type="checkbox" onclick="toggleComprado(${item.id})" ${item.comprado ? 'checked' : ''}>
            ${item.nome} (${item.quantidade}x) - R$ ${(item.preco * item.quantidade).toFixed(2)}
            <button onclick="removerItem(${item.id})">❌</button>
        </li>
    `).join('');

    atualizarTotal();
}

// ==========================
// TOTAL
// ==========================
function atualizarTotal() {
    const total = listaDeCompras.reduce((soma, item) => {
        if (!item.comprado) {
            return soma + (item.preco * item.quantidade);
        }
        return soma;
    }, 0);

    document.getElementById('valorTotal').textContent = `R$ ${total.toFixed(2)}`;
}

// ==========================
// AÇÕES
// ==========================
function removerItem(id) {
    listaDeCompras = listaDeCompras.filter(item => item.id !== id);
    renderizarLista();
}

function toggleComprado(id) {
    const item = listaDeCompras.find(i => i.id === id);
    if (item) {
        item.comprado = !item.comprado;
        renderizarLista();
    }
}

// ==========================
// UTIL
// ==========================
function limparInputs() {
    document.getElementById('item').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('quantidade').value = '1';
}

// ENTER adiciona
document.getElementById('item').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') adicionarItem();
});

// botão
document.getElementById('adicionarBtn').addEventListener('click', adicionarItem);

// iniciar
configurarAutocomplete();
renderizarLista();