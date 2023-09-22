import { prisma } from "./prisma.js";

const CLASSES = [
    {
        name: "Mago",
        description:
            "Os magos são mestres das artes arcanas, capazes de lançar feitiços poderosos e controlar a magia em todas as suas formas.",
    },
    {
        name: "Arqueiro",
        description:
            "Os arqueiros são especialistas em combate à distância, usando arcos e flechas para atacar seus inimigos com precisão mortal.",
    },
    {
        name: "Guerreiro",
        description:
            "Os guerreiros são combatentes corpo a corpo habilidosos, usando armaduras pesadas e armas poderosas para enfrentar seus oponentes de frente.",
    },
    {
        name: "Ladrão",
        description:
            "Os ladrões são mestres da furtividade e da astúcia, especializados em roubo, espionagem e evasão.",
    },
    {
        name: "Clérigo",
        description:
            "Os clérigos são servos de divindades, capazes de canalizar poderes divinos para curar ferimentos, proteger aliados e punir os ímpios.",
    },
    {
        name: "Bárbaro",
        description:
            "Os bárbaros são guerreiros ferozes e indomáveis, que lutam em um frenesi de fúria, ignorando dor e cansaço.",
    },
    {
        name: "Druida",
        description:
            "Os druidas são guardiões da natureza, conectados com os elementos e capazes de transformações animais e manipulação ambiental.",
    },
    {
        name: "Paladino",
        description:
            "Os paladinos são cavaleiros sagrados, jurados a servir a justiça e proteger os inocentes, com poderes divinos para apoiar sua causa.",
    },
    {
        name: "Necromante",
        description:
            "Os necromantes são praticantes das artes sombrias, capazes de controlar os mortos e lançar maldições terríveis.",
    },
    {
        name: "Feiticeiro",
        description:
            "Os feiticeiros são magos natos, com um talento inato para a magia e a capacidade de moldar a realidade com sua vontade.",
    },
];

export const ClassesSetup = async function () {
    for (const classe of CLASSES) {
        try {
            await prisma.classe.create({
                data: {
                    name: classe.name,
                    description: classe.description,
                },
            });
            console.log("\tCreated", classe.name);
        } catch {
            console.log("\tSkipping", classe.name);
        }
    }
};
