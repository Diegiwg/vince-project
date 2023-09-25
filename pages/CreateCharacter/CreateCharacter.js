import { $Classe, $Race } from "../../modules/Database.js";
import { Data, EmitEvent, Page, Toast } from "../../modules/Functions.js";

/**
 *
 */
export async function load() {
    const races = {
        elements: [],
    };

    for (const race of await $Race.findAll()) {
        races.elements.push(race.name);

        races[race.name] = {
            id: race.id,
            name: race.name,
            description: race.description,
            hp: race.hp,
            sp: race.sp,
            mp: race.mp,

            classes: race.classes.map((c) => c.name),
        };
    }

    const classes = {};

    for (const classe of await $Classe.findAll()) {
        classes[classe.name] = classe;
    }

    return {
        points_limit: 30,
        races,
        classes,
    };
}

/**
 *
 */
export function mount() {
    /** @type {{points_limit: number, races: Array, classes: Array}} */
    const l_data = Data.get().page_data;

    /**
     *
     */
    function _setRaces() {
        Page.querySelector("ex-race-selector").set(l_data.races.elements);
    }

    /**
     *
     */
    function _setAttributesFields() {
        Page.querySelector("ex-create-character-attributes").setFields([
            { name: "strength", text: "Força" },
            { name: "agility", text: "Agilidade" },
            { name: "vitality", text: "Vitalidade" },
            { name: "intelligence", text: "Inteligência" },
            { name: "spirituality", text: "Espiritualidade" },
        ]);
    }

    /**
     *
     * @param event
     */
    function _submitHandler(event) {
        event.preventDefault();

        const l_name = Page.querySelector("input[name='name']").value;
        const l_race = Page.querySelector("ex-race-selector").get();
        const l_classe = Page.querySelector("ex-classe-selector").get();
        const l_attributes = Page.querySelector(
            "ex-create-character-attributes"
        ).get();

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

        // TODO: Adicionar a verificação do Schema com o ValiBot.
        EmitEvent("CreateCharacter", {
            name: l_name,
            race: l_race,
            classe: l_classe,
            attributes: l_attributes,
        });
    }

    _setRaces();
    _setAttributesFields();

    Page.querySelector("form").addEventListener("submit", _submitHandler);

    Page.querySelector("#Cancel").addEventListener("click", () => {
        EmitEvent("RequestPage", { page: "Home" });
    });

    Page.querySelector("#Random").addEventListener("click", () => {
        Page.querySelector("ex-create-character-attributes")?.randomize();
    });
}
