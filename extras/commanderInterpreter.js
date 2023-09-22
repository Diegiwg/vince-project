/* 
    Estrutura esperada de um comando:
    /command-name argname=[argvalue] argname=[argvalue] ...
*/

/**
 *
 * @param {string} string
 */
function parserCommand(string) {
    if (!string.startsWith("/")) {
        return {
            type: "error",
            value: "Não foi encontrado a estrutura de um comando!",
        };
    }

    // Split the command name for the args...
    const commandName = string.matchAll(/\/([\w-]+)?/g)?.next().value[1];

    // Split args in pair of key/value
    const commandArgs = string;

    return commandName;
}

console.log(parserCommand("olaMundo"));
console.log(parserCommand("/comandinho"));
console.log(parserCommand('/ComandoComArgs name=["diego"]'));
