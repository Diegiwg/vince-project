import { prisma } from "./prisma.js";

/**
 * @param {string[]} classes Lista contendo os nomes das classes.
 * @returns {number[]} Lista contendo os IDs das classes.
 */
async function classesNamesToId(classes) {
    const ids = new Set();
    for (const classe of classes) {
        const classeData = await prisma.classe.findUnique({
            where: { name: classe },
        });

        if (!classeData) continue;

        ids.add({ id: classeData?.id });
    }

    return Array.from(ids);
}

const RACES = [
    {
        name: "Elfo",
        description:
            "Os elfos são uma raça mágica e elegante, conhecida por sua agilidade e afinidade com a natureza.",
        hp: 100,
        mp: 150,
        sp: 200,
        classes: ["Arqueiro", "Mago"],
    },
    {
        name: "Anão",
        description:
            "Os anões são uma raça robusta e habilidosa em trabalhar com metais e pedras, conhecidos por sua resistência e força.",
        hp: 130,
        mp: 100,
        sp: 180,
        classes: ["Guerreiro", "Clérigo"],
    },
    {
        name: "Humano",
        description:
            "Os humanos são uma raça versátil, adaptável a várias classes e estilos de jogo.",
        hp: 120,
        mp: 120,
        sp: 220,
        classes: ["Guerreiro", "Mago", "Ladrão"],
    },
    {
        name: "Orc",
        description:
            "Os orcs são uma raça bruta e agressiva, conhecida por sua força física e habilidade em combate corpo a corpo.",
        hp: 150,
        mp: 100,
        sp: 250,
        classes: ["Bárbaro", "Guerreiro"],
    },
    {
        name: "Gnomo",
        description:
            "Os gnomos são uma raça pequena e engenhosa, especializados em inventar dispositivos e solucionar problemas.",
        hp: 90,
        mp: 180,
        sp: 150,
        classes: ["Mago", "Engenheiro"],
    },
    {
        name: "Dragãoborn",
        description:
            "Os dragãoborns são descendentes de dragões, possuindo escamas e poderes elementais.",
        hp: 140,
        mp: 160,
        sp: 210,
        classes: ["Paladino", "Feiticeiro"],
    },
    {
        name: "Meio-Elfo",
        description:
            "Meio-elfos são uma combinação das características de elfos e humanos, sendo versáteis e carismáticos.",
        hp: 110,
        mp: 140,
        sp: 190,
        classes: ["Clérigo", "Ladrão"],
    },
    {
        name: "Lobisomem",
        description:
            "Lobisomens são seres míticos que podem se transformar em lobos, sendo ferozes em combate.",
        hp: 140,
        mp: 120,
        sp: 220,
        classes: ["Guerreiro", "Necromante"],
    },
    {
        name: "Sereiano",
        description:
            "Os sereianos são criaturas marinhas, com habilidades aquáticas e conexão com o oceano.",
        hp: 120,
        mp: 200,
        sp: 170,
        classes: ["Druida", "Feiticeiro"],
    },
    {
        name: "Troll",
        description:
            "Trolls são grandes e resistentes, conhecidos por sua regeneração rápida e força física imensa.",
        hp: 140,
        mp: 100,
        sp: 240,
        classes: ["Bárbaro", "Necromante"],
    },
];

export const RacesSetup = async function () {
    for (const race of RACES) {
        try {
            const classesIds = await classesNamesToId(race.classes);

            await prisma.race.create({
                data: {
                    name: race.name,
                    description: race.description,
                    hp: race.hp,
                    mp: race.mp,
                    sp: race.sp,
                    classes: {
                        connect: classesIds,
                    },
                },
            });
            console.log("\tCreated", race.name);
        } catch {
            console.log("\tSkipping", race.name);
        }
    }
};
