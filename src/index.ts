import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})


//BANDAS
//RETORNAR TODAS AS BANDAS
app.get("/bands", async (req: Request, res: Response) => {
    try {
        const result = await db.raw(`SELECT * FROM bands;`)
        res.status(200).send({ result })
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})


//CRIAR UMA NOVA BANDA
app.post("/bands", async (req: Request, res: Response) => {
    try {
        //PARA CRIAÇÃO DE BANDA É NECESSÁRIO UM id E UM name
        const id: string = Math.floor(Date.now() * Math.random()).toString(36) //Cria ID aleatório
        const name: string = req.body.name

        if (!name || typeof name !== "string") {
            throw new Error("é necessário enviar um 'name' do tipo 'string'")
        }
        const [nameExists]: {}[] = await db.raw(`SELECT * FROM bands WHERE name = "${name}";`)
        if (nameExists) {
            throw new Error("banda já existe no banco de dados")
        }
        const newEntry = await db.raw(`INSERT INTO bands(id, name) VALUES ("${id}", "${name}")`)
        res.status(201).send("banda criada com sucesso")
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})


//EDITAR NOME DA BANDA
app.put("/bands/:id", async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id
        const name: string = req.body.name
        if (!id || !name || typeof name !== "string") {
            throw new Error("é necessário passar um 'id' e um 'name'. o tipo de 'name' precisa ser 'string'")
        }
        const [bandIdExists]: {}[] = await db.raw(`SELECT * FROM bands WHERE id = "${id}"`)
        if (!bandIdExists) {
            throw new Error("id da banda não encontrado")
        }
        const [bandNameExists]: {}[] = await db.raw(`SELECT * FROM bands WHERE name = "${name}"`)
        if (bandNameExists) {
            throw new Error("nome da banda já existe, digite um novo nome")
        }
        const result = await db.raw(`UPDATE bands SET name = "${name}" WHERE id = "${id}"`)
        res.status(201).send("banda alterada com sucesso")
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})


//MÚSICAS
// RETORNAR TODAS AS MÚSICAS
app.get("/songs", async (req: Request, res: Response) => {
    try {
        const result: {}[] = await db.raw(`SELECT * FROM songs;`)
        res.status(200).send({ result })
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})


//CRIAR NOVA MÚSICA
app.post("/songs", async (req: Request, res: Response) => {
    //PARA CRIAÇÃO DE UMA MÚSICA É NECESSÁRIO id, name E band_id
    try {
        const id: string = Math.floor(Date.now() * Math.random()).toString(36)
        const { name, bandId }: { name: string, bandId: string } = req.body

        if (!name || !bandId || typeof name !== "string" || typeof bandId !== "string") {
            throw new Error("é necessário informar o 'name' e o 'bandId' como string")
        }
        
        const [musicExists]: {}[] = await db.raw(`SELECT * FROM songs WHERE name = "${name}" AND band_id = "${bandId}";`)
        if (musicExists) {
            throw new Error("Já existe uma música com esse nome cadastrada para essa banda")
        }
        const [bandExists]: {}[] = await db.raw(`SELECT * FROM bands WHERE id = "${bandId}"`)
        if (!bandExists) {
            throw new Error("id da banda não encontrado")
        }
        const newEntry = await db.raw(`INSERT INTO songs(id, name, band_id) VALUES ("${id}", "${name}", "${bandId}")`)
        res.status(201).send("música adicionada com sucesso")
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})


//EDITAR MÚSICA
app.put("/songs/:id", async (req: Request, res: Response) => {
    try {
        //FAZER ALTARAÇÃO NO NOME DA MÚSICA A PARTIR DO ID DELA
        const id: string = req.params.id
        const name: string = req.body.name
        if (!id || !name || typeof name !== "string") {
            throw new Error("é necessário passar um 'id' e um 'name'. o tipo de 'name' precisa ser 'string'")
        }
        const [songIdExists]: {}[] = await db.raw(`SELECT * FROM songs WHERE id = "${id}"`)
        if (!songIdExists) {
            throw new Error("id da música não encontrado")
        }
        const [songNameExists]: {}[] = await db.raw(`SELECT * FROM songs WHERE name = "${name}"`)
        if (songNameExists) {
            throw new Error("nome da música já existe para essa banda")
        }
        const result = await db.raw(`UPDATE songs SET name = "${name}" WHERE id = "${id}"`)
        res.status(201).send("música alterada com sucesso")
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})