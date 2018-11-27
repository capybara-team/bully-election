# Bully Election

Bully Election Algorithm using NodeJS & HTTP. [GitHub](https://github.com/capybara-team/bully-election)

## Instalação

Antes de começar, certifique-se que tem instalado em sua máquina o runtime [NodeJS](https://nodejs.org/en/)

```bash
nodejs -v # v8.10.0
```

[Baixe o código](https://github.com/capybara-team/bully-election/archive/master.zip) e descompacte-o, ou clone o repositório:

```bash
git clone https://github.com/capybara-team/bully-election.git
```

Instale as dependências do projeto e gere o build

```bash
cd bully-election # Acessa a pasta
npm install # Instala as dependências
npm run build # Gera o código transpilado
```

Inicialize as instâncias executando

```bash
npm start
```

o script [start.sh](./start.sh) irá ser executado, iniciando 10 servidores nós em sua rede local, usando as portas 4000 à 4009

Todos os nós rodam uma API Rest em HTTP (acesse <http://localhost:4000>, <http://localhost:4009> ou outra porta).

## Funcionamento
  
Cada nó irá ser inicializado com um parâmetro `node-id=ID` onde ID é um valor numérico que irá ser usado como ID do nó e a porta que irá rodar (por padrão).
  
O Arquivo [nodes.js](./src/nodes.js) contém uma lista de todos os nós participantes da rede e seus respectivos endereços.
  
Ao ingressar na rede, o nó irá enviar aos seus superiores (nós de ID maior) um sinal de eleição.

Estes irão responder o sinal e mandar um novo para os seus próprios superiores.

Ao terminar o envio do sinal, o nó irá verificar se houve alguma resposta (OK) e se não houver, irá aguardar o fim das eleições dos seus superiores (que irão avisá-lo quando concluídas).

Caso não haja nenhuma resposta, o nó irá se auto-proclamar o novo líder pois todos os seus superiores estão fora do ar.

Para isto, irá avisar a todos os nós da rede que ele é o novo lider.

A eleição é refeita sempre que um nó ingressa na rede ou quando um nó se comunica com o líder e este não dá resposta.
  
## Uso
  
O projeto está sendo executado em cima de uma API Rest em HTTP, disponibilizando algumas rotas para experimentos. Além disso, o console que executar a aplicação irá dar alguns feedbacks sobre início de eleições ou quando nós são eleitos.

Abaixo estão algumas rotas disponíveis:

- [`/status`](http://localhost:4000/) e  e `/`(raíz): Rota que informa o status daquele nó
  - É Enviado informações como Id, Porta, seu líder e se está online (se offline, a rota `/` não é acessível
- [`/toggle`](http://localhost:4000/toggle): liga ou desliga o servidor. Se re-ligado, este irá executar uma nova eleição.
- [`/election`](http://localhost:4000/election): Tratamento de eleições
  - `GET`: retorna se está online (`OK`) e envia um sinal para seus superiores. Se os seus superiores não derem resposta, se auto-proclama novo líder.
  - `POST`: Recebe no parâmetro `leader` o ID do novo líder eleito. Ao um novo líder se auto-proclamar, este envia esta rota para todos os outros nós.
- [`/leader`](http://localhost:4000/leader): Faz com que este nó se conecte com o seu líder e retorne as informações obtidas dele. Caso o mesmo Não responda, é iniciada uma nova eleição.

## Exemplo de uso

Após iniciar os servidores:

- Acesse <http://localhost:4000/>: O nó 0 informará que seu líder é o nó 9
- Acesse <http://localhost:4009/toggle>: O nó 9(atual líder) irá ser desligado
- Acesse <http://localhost:4009/>: Seu navegador irá indicar erro 503 (indisponível), pois o nó 9 está desligado.
- Acesse <http://localhost:4006/leader>: O nó 6 irá indicar erro pois o líder 9 está offline, iniciando uma nova eleição
- Acesse novamente <http://localhost:4006/leader>: Agora o nó 6 irá conseguir buscar no seu novo líder eleito (nó 8) retornando suas informações.
- Acesse  <http://localhost:4000/>: Agora o nó 0 irá informar que seu líder é o nó 8
- Acesse  <http://localhost:4009/toggle>: O nó 9 irá ser re-ativado e inicializará uma nova eleição, resultando em sua eleição.
- Acesse  <http://localhost:4000/>: Agora o nó 0 irá informar que seu líder é o nó 9 novamente