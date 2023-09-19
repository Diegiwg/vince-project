import { Data, EmitEvent, Page, Toast } from "../modules/Functions.js";

export async function load() {
    return {
        points_limit: 30,
        races: {
            elements: ["Elfo", "Anão", "Humano", "Orc"],
            Elfo: {
                id: 1,
                name: "Elfo",
                hp: 80,
                sp: 120,
                mp: 100,
                description:
                    "Os elfos são conhecidos por sua graça e agilidade. São uma raça que vive em sintonia com a natureza e são habilidosos arqueiros.",
                classes: ["Arqueiro", "Mago"],
            },
            Anão: {
                id: 2,
                name: "Anão",
                hp: 120,
                sp: 60,
                mp: 40,
                description:
                    "Os anões são conhecidos por sua força e resistência. São habilidosos ferreiros e mineradores, e vivem nas profundezas das montanhas.",
                classes: ["Guerreiro", "Bárbaro"],
            },
            Humano: {
                id: 3,
                name: "Humano",
                hp: 100,
                sp: 100,
                mp: 80,
                description:
                    "Os humanos são uma raça versátil e adaptável. Eles não possuem características físicas sobrenaturais, mas são conhecidos por sua capacidade de aprender e dominar a magia.",
                classes: ["Mago", "Guerreiro", "Arqueiro"],
            },
            Orc: {
                id: 4,
                name: "Orc",
                hp: 150,
                sp: 80,
                mp: 20,
                description:
                    "Os orcs são uma raça musculosa e agressiva. Eles têm uma afinidade natural com a brutalidade e são temidos em combate.",
                classes: ["Bárbaro", "Guerreiro"],
            },
        },
        classes: {
            classes: ["Arqueiro", "Guerreiro", "Mago", "Bárbaro"],
            Arqueiro: {
                id: 1,
                description:
                    "Um mestre do arco e flecha, especializado em ataques à distância.",
            },
            Guerreiro: {
                id: 2,
                description:
                    "Um combatente resistente que usa armas pesadas e armaduras.",
            },
            Mago: {
                id: 3,
                description:
                    "Um usuário de magia que pode lançar feitiços poderosos.",
            },
            Bárbaro: {
                id: 4,
                description:
                    "Um guerreiro feroz que entra em frenesi durante a batalha.",
            },
        },
    };
}

export function mount() {
    const l_data = Data.get().page_data;
    console.log(l_data);

    function _setRaces() {
        Page.querySelector("ex-race-selector").set(l_data.races.elements);
    }

    function _setAttributesFields() {
        Page.querySelector("ex-create-character-attributes").setFields([
            { name: "strength", text: "Força" },
            { name: "agility", text: "Agilidade" },
            { name: "vitality", text: "Vitalidade" },
            { name: "intelligence", text: "Inteligência" },
            { name: "spirituality", text: "Espiritualidade" },
        ]);
    }

    function _submitHandler(event) {
        event.preventDefault();

        const l_name = Page.querySelector("input[name='name']").value;
        const l_race = Page.querySelector("ex-race-selector").get();
        const l_classe = Page.querySelector("ex-classe-selector").get();
        const l_attributes = Page.querySelector(
            "ex-create-character-attributes"
        ).get();

        console.log(l_name, l_race, l_classe, l_attributes);

        // Verificar se algum valor é vazio ou nulo
        if (!l_name || l_name.length === 0 || !l_race || !l_classe)
            return Toast.add({
                type: "WARN",
                message: "Preencha todos os campos.",
            });

        // Verificar se ainda tem pontos sobrando
        if (!l_attributes)
            return Toast.add({
                type: "WARN",
                message: "Você ainda tem pontos para distribuir.",
            });

        EmitEvent("CreateCharacter", {
            name: l_name,
            race: l_race,
            classe: l_classe,
            attributes: l_attributes,
        });
    }

    // MOUNT
    _setRaces();
    _setAttributesFields();

    Page.querySelector("form").addEventListener("submit", _submitHandler);
}
