const { Prisma } = require("../../../generated/prisma")
const bcrypt = require("bcrypt")

module.exports = Prisma.defineExtension({
    name: "yoloHashPassword",
    query: {
        user:{
            create: async ({args, query}) => {
                try{
                    const hash = await bcrypt.hash(args.data.password, 10)
                    args.data.password = hash
                    return query(args)
                }
                catch(error){
                    throw error
                }
            }
        }
    }
})