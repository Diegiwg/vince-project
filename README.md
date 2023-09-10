# Projeto do Vince

## Paginas

### Inicio

- Tem um chat, que é global, ou seja, todo mundo pode falar e ler
- Tem um espaço para mostrar as informações básicas do perfil do usuário, como Nome, quantidade de personagens, e etc...
- Tem uma lista de possíveis comandos (botões), tais como "Entrar em uma Sala", "Criar uma Sala", "Gerenciar Personagens", "Sair da Conta"

## Objetos

- Perfil:

```javascript
{
    id: Number,
    name: String,
    email: String,
    password: String,

    characters: Character[]
}
```

- Personagem:

```javascript
{
    id: Number,
    name: String,
    race: Race,
    class: Class,
    attributes: Attributes

    profile: Profile,
}
```
