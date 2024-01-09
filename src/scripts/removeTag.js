const prisma = require("../prisma");

const removeTag = async () => {

await prisma.assets.updateMany({
    where: {
        author : "$simp"
    }, 
    data: {
        campaign: null
    }
})

}
