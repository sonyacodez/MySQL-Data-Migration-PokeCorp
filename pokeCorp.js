const Sequelize = require('sequelize')
const sequelize = new Sequelize('mysql://root:@localhost/sql_testing')
const data = require('./data.json')

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });


const findAllTypes = (data) => {
    let types = {}
    data.forEach(d => !types[d.type] ? types[d.type] = 0 : null)
    return types
}
const findAllTowns = (data) => {
    let towns = {}
    data.forEach(d => d.ownedBy
        .forEach(o => !towns[o.town] ? towns[o.town] = 0 : null))
    return towns
}
const findAllTrainersAndTowns = (data) => {
    let allTrainersAndTowns = {}
    data.forEach(d => d.ownedBy
        .forEach(o => !allTrainersAndTowns[o.name] ? allTrainersAndTowns[o.name] = o.town : null))
    return allTrainersAndTowns
}
const addPokemonType = async(data) => {
    const allTypes = findAllTypes(data)
    const allTypesArray = Object.keys(allTypes)
    for(let type of allTypesArray){
        let query = `INSERT INTO pokemon_type VALUES(null, '${type}')`
        await sequelize.query(query)
    }
}

const addTown = async(data) => {
    const allTowns = findAllTowns(data)
    const allTownsArray = Object.keys(allTowns)
    for(let town of allTownsArray){
        let query = `INSERT INTO town VALUES(null, '${town}')`
        await sequelize.query(query)
    }
}
const addTrainer = async(data) => {
    const allInfo = findAllTrainersAndTowns(data)
    const allTrainersAndTowns = Object.entries(allInfo)
    for(let t of allTrainersAndTowns){
        let townQuery = `
            SELECT t.id
            FROM town AS t
            WHERE t.name = '${t[1]}'`
        let townID = await sequelize.query(townQuery).spread((result, metadata) => result)
        await sequelize.query(`
            INSERT INTO trainer 
            VALUES (null, '${t[0]}', ${townID[0].id})`
        )
    }
}
const addPokemonAndTrainers = async(data) => {
    await data.forEach(async(d) => {
        let query = `SELECT p.id FROM pokemon AS p WHERE p.name = '${d.name}'`
        let pokemonID = await sequelize.query(query).spread((result, metadata) => result)
        d.ownedBy.forEach(async(o) => {
            let query = `SELECT t.id FROM trainer AS t WHERE t.name = '${o.name}'`
            let trainerID = await sequelize.query(query).spread((result, metadata) => result)
            let pokemonAndTrainer = `INSERT INTO pokemon_trainer VALUES(${pokemonID[0].id}, ${trainerID[0].id})`
            await sequelize.query(pokemonAndTrainer)
        })
    })
}

const addPokemonAndTrainerData = async(data) => {
    await addPokemonType(data)
    for(let d of data){
        let typeQuery = `
            SELECT p.id 
            FROM pokemon_type AS p 
            WHERE p.name = '${d.type}'`
        let pokemonTypeID = await sequelize.query(typeQuery).spread((result, metadata) => result)
        let query = `
            INSERT INTO pokemon VALUES
            (null, '${d.name}', ${d.height}, ${d.weight}, ${pokemonTypeID[0].id})`
        await sequelize.query(query)
    }
    await addTown(data)
    await addTrainer(data)
    await addPokemonAndTrainers(data)
}

// addPokemonAndTrainerData(data)

// --------First Version of Heaviest Pokemon Function----------

// const heaviestPokemon = async() => {
//     let heaviestWeight = await sequelize
//         .query(`
//             SELECT MAX(weight) AS weight 
//             FROM pokemon`)
//         .spread((result, md) => result[0].weight)
//     let query = `SELECT p.name FROM pokemon AS p WHERE p.weight = ${heaviestWeight}`
//     let heaviestPokemon = await sequelize.query(query).spread((result, metadata) => result[0].name)
//     return heaviestPokemon
// }

// --------Improved Heaviest Pokemon Function----------

const heaviestPokemon = async() => {
    let heaviestWeight = await sequelize
        .query(`
            SELECT name, weight
            FROM pokemon
            ORDER BY weight DESC`)
        .spread((result, md) => result[0].name)
    return heaviestWeight
}

// heaviestPokemon()

// --------First Version of findByType Function----------

// const findByType = async(pokemonType) => {
//     let pokemonTypeID = await sequelize
//         .query(`
//             SELECT p.id 
//             FROM pokemon_type AS p 
//             WHERE p.name = '${pokemonType}'`)
//         .spread((result, md) => result[0].id)
//     let pokemonOfType = await sequelize
//         .query(`
//             SELECT p.name 
//             FROM pokemon AS p 
//             WHERE p.type = ${pokemonTypeID}`)
//         .spread((result, md) => result)
//     let pokemonArray = []
//     pokemonOfType.forEach(p => pokemonArray.push(p.name))
//     return pokemonArray
// }

// --------Improved findByType Function----------

const findByType = async(pokemonType) => {
    let pokemonOfType = await sequelize
        .query(`
            SELECT p.name AS name
            FROM pokemon AS p, pokemon_type AS type 
            WHERE type.name = '${pokemonType}'
            AND p.type = type.id`)
        .spread((result, md) => result)
    let pokemonNamesArray = []
    pokemonOfType.forEach(p => pokemonNamesArray.push(p.name))
    return pokemonNamesArray
}

// findByType("grass")

// --------First Version of findOwners Function----------

// const findOwners = async(pokemonName) => {
//     let pokemonID = await sequelize
//         .query(`
//             SELECT p.id 
//             FROM pokemon AS p 
//             WHERE p.name = '${pokemonName}'`)
//         .spread((result, md) => result[0].id)
//     let trainersID = await sequelize
//         .query(`
//             SELECT pt.trainer
//             FROM pokemon_trainer AS pt  
//             WHERE pt.pokemon = ${pokemonID}`)
//         .spread((result, md) => result)
//     let trainers = await sequelize
//         .query(`
//             SELECT t.name, t.id
//             FROM trainer AS t`)
//         .spread((result, md) => result)
//     let names = []
//     trainersID.forEach(id => {
//         let trainerName = trainers.find(t => t.id === id.trainer).name
//         names.push(trainerName)
//     })
//     return names
// }

// --------Improved findOwners Function----------

const findOwners = async(pokemonName) => {
    let trainers = await sequelize
        .query(`
            SELECT t.name
            FROM trainer AS t, pokemon_trainer AS pt, pokemon AS p
            WHERE p.name = '${pokemonName}'
            AND pt.pokemon = p.id
            AND t.id = pt.trainer`)
        .spread((result, md) => result)
    let names = []
    trainers.forEach(t => names.push(t.name))
    return names
}

// findOwners("gengar")

// --------First Version of findPokemonOfOwner Function----------

// const findPokemonOfOwner = async(trainerName) => {
//     let trainerID = await sequelize
//         .query(`
//             SELECT t.id 
//             FROM trainer AS t 
//             WHERE t.name = '${trainerName}'`)
//         .spread((result, md) => result[0].id)
//     let pokemonsID = await sequelize
//         .query(`
//             SELECT pt.pokemon
//             FROM pokemon_trainer AS pt  
//             WHERE pt.trainer = ${trainerID}`)
//         .spread((result, md) => result)
//     let pokemon = await sequelize
//         .query(`
//             SELECT p.name, p.id
//             FROM pokemon AS p`)
//         .spread((result, md) => result)
//     let names = []
//     pokemonsID.forEach(id => {
//         let pokemonName = pokemon.find(p => p.id === id.pokemon).name
//         names.push(pokemonName)
//     })
//     return names
// }

// --------Improved findOwners Function----------

const findPokemonOfOwner = async(trainerName) => {
    let pokemon = await sequelize
        .query(`
            SELECT p.name
            FROM trainer AS t, pokemon_trainer AS pt, pokemon AS p
            WHERE t.name = '${trainerName}'
            AND pt.pokemon = p.id
            AND t.id = pt.trainer`)
        .spread((result, md) => result)
    let names = []
    pokemon.forEach(p => names.push(p.name))
    return names
}

// findPokemonOfOwner("Loga")

const pokemonWithMostOwners = async() => {
    let pokemon = await sequelize
        .query(`
            SELECT p.name, COUNT(pt.pokemon) AS count
            FROM pokemon_trainer AS pt, pokemon AS p
            WHERE p.id = pt.pokemon
            GROUP BY p.name
            ORDER BY COUNT(pt.pokemon) DESC`)
        .spread((result, md) => result)
    const topPokemon = pokemon.filter(p => p.count === pokemon[0].count)
    return topPokemon.map(top => top.name)
}

// pokemonWithMostOwners()
