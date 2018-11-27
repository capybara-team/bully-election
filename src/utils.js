const args = process.argv
    .slice(2)
    .map(arg => arg.split('='))
    .reduce((args, [value, key]) => {
        args[value] = key;
        return args;
    }, {});

    
export function getArgs() {
    return args
}

export function getArg(name, def = null) {
    return (args[name] === undefined) ? def : args[name]
}

