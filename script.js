const formularioCliente = document.getElementById('formulario-cliente');
const areaResultado = document.getElementById('area-resultado');
const infoCliente = document.getElementById('info-cliente');
const climaDados = document.getElementById('clima-dados');
const climaCarregando = document.getElementById('clima-carregando');
const listaClientes = document.getElementById('lista-de-clientes');
const containerClientes = document.getElementById('container-clientes');
const botaoLimpar = document.getElementById('botao-limpar');
const botaoNovoCadastro = document.getElementById('botao-novo-cadastro');
const botaoVerClientes = document.getElementById('botao-ver-clientes');
const botaoVoltar = document.getElementById('botao-voltar');

// Campos
const campoCep = document.getElementById('campo-cep');
const campoLogradouro = document.getElementById('campo-logradouro');
const campoBairro = document.getElementById('campo-bairro');
const campoCidade = document.getElementById('campo-cidade');
const campoEstado = document.getElementById('campo-estado');

//  CEP
campoCep.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    e.target.value = value;
});

// endereço pelo CEP
campoCep.addEventListener('blur', function () {
    const cep = this.value.replace(/\D/g, '');
    if (cep.length === 8) {
        buscarEnderecoPorCep(cep);
    }
});

async function buscarEnderecoPorCep(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
            campoLogradouro.value = data.logradouro;
            campoBairro.value = data.bairro;
            campoCidade.value = data.localidade;
            campoEstado.value = data.uf;
        } else {
            alert('CEP não encontrado!');
        }
    } catch (error) {
        alert('Erro ao buscar CEP.');
    }
}

// Limpa formulário
botaoLimpar.addEventListener('click', () => formularioCliente.reset());

// Envio do formulário
formularioCliente.addEventListener('submit', function (e) {
    e.preventDefault();
    const cliente = {
        id: Date.now(),
        nome: document.getElementById('campo-nome').value,
        email: document.getElementById('campo-email').value,
        telefone: document.getElementById('campo-telefone').value,
        cep: campoCep.value,
        logradouro: campoLogradouro.value,
        bairro: campoBairro.value,
        cidade: campoCidade.value,
        estado: campoEstado.value
    };
    salvarCliente(cliente);
    exibirResultado(cliente);
    buscarClima(cliente.cidade, cliente.estado);
});

// Salva cliente
function salvarCliente(cliente) {
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
}

// Exibi resultado
function exibirResultado(cliente) {
    formularioCliente.classList.add('oculto');
    areaResultado.classList.remove('oculto');

    infoCliente.innerHTML = `
        <p><strong>Nome:</strong> ${cliente.nome}</p>
        <p><strong>E-mail:</strong> ${cliente.email}</p>
        <p><strong>Telefone:</strong> ${cliente.telefone}</p>
        <p><strong>Endereço:</strong> ${cliente.logradouro}, ${cliente.bairro}</p>
        <p><strong>Cidade:</strong> ${cliente.cidade} - ${cliente.estado}</p>
        <p><strong>CEP:</strong> ${cliente.cep}</p>
    `;

    climaCarregando.classList.remove('oculto');
    climaDados.classList.add('oculto');
}

// Busc clima
async function buscarClima(cidade, estado) {
    try {
        const apiKey = '8cc85b402a733c3c45ec84e3dd06f83e';
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${cidade},${estado},BR&units=metric&appid=${apiKey}&lang=pt_br`
        );

        if (!response.ok) throw new Error();

        const data = await response.json();
        exibirClima(data);

    } catch (error) {
        climaCarregando.classList.add('oculto');
        climaDados.innerHTML = `
            <div class="error">
                <p>Não foi possível obter o clima.</p>
            </div>
        `;
        climaDados.classList.remove('oculto');
    }
}

function exibirClima(data) {
    const temperatura = Math.round(data.main.temp);

    let cor = temperatura < 15 ? 'azul'
             : temperatura <= 30 ? 'verde'
             : 'vermelho';

    const horaLocal = calcularHoraLocal(data.timezone);

    climaCarregando.classList.add('oculto');
    climaDados.innerHTML = `
        <h3>Clima em ${data.name}</h3>
        <div class="temperatura ${cor}">${temperatura}°C</div>
        <p>${data.weather[0].description}</p>
        <p class="hora-local">Hora local: ${horaLocal}</p>
    `;
    climaDados.classList.remove('oculto');
}

function calcularHoraLocal(offset) {
    const now = new Date();
    const hora = new Date(now.getTime() + offset * 1000);

    return hora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC'
    });
}

// Novo cadastro
botaoNovoCadastro.addEventListener('click', () => {
    areaResultado.classList.add('oculto');
    formularioCliente.classList.remove('oculto');
    formularioCliente.reset();
});

// Ver clientes
botaoVerClientes.addEventListener('click', () => {
    areaResultado.classList.add('oculto');
    listaClientes.classList.remove('oculto');
    exibirListaClientes();
});

// Voltar
botaoVoltar.addEventListener('click', () => {
    listaClientes.classList.add('oculto');
    formularioCliente.classList.remove('oculto');
});

// Lista clientes
function exibirListaClientes() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

    if (clientes.length === 0) {
        containerClientes.innerHTML = '<p>Nenhum cliente cadastrado.</p>';
        return;
    }

    containerClientes.innerHTML = '';

    clientes.forEach(cliente => {
        const el = document.createElement('div');
        el.className = 'cliente-item';
        el.innerHTML = `
            <p><strong>${cliente.nome}</strong></p>
            <p>${cliente.cidade} - ${cliente.estado}</p>
        `;
        el.addEventListener('click', () => exibirDetalhesCliente(cliente));
        containerClientes.appendChild(el);
    });
}

// Exibe detalhes do cliente
function exibirDetalhesCliente(cliente) {
    listaClientes.classList.add('oculto');
    areaResultado.classList.remove('oculto');

    infoCliente.innerHTML = `
        <p><strong>Nome:</strong> ${cliente.nome}</p>
        <p><strong>E-mail:</strong> ${cliente.email}</p>
        <p><strong>Telefone:</strong> ${cliente.telefone}</p>
        <p><strong>Endereço:</strong> ${cliente.logradouro}, ${cliente.bairro}</p>
        <p><strong>Cidade:</strong> ${cliente.cidade} - ${cliente.estado}</p>
        <p><strong>CEP:</strong> ${cliente.cep}</p>
    `;

    climaCarregando.classList.remove('oculto');
    climaDados.classList.add('oculto');

    buscarClima(cliente.cidade, cliente.estado);
}

document.addEventListener('DOMContentLoaded', () => {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    console.log(`Sistema carregado com ${clientes.length} clientes cadastrados.`);
});
