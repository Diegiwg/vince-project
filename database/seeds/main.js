import { ClassesSetup } from "./classes.js";
import { RacesSetup } from "./races.js";
import { UsersSetup } from "./users.js";

/**
 * Função responsável por criar alguns dados iniciais no banco de dados (para testes).
 */
async function main() {
    console.log("Creating the Classes:");
    await ClassesSetup();

    console.log("Creating the Races:");
    await RacesSetup();

    console.log("Creating the Users:");
    await UsersSetup();
}

main();
