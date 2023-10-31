// const db = require("../utils/db/db");
// const { templateSchema } = require("../schema/schema");
// const fs = require("fs");

// const dumpTemplate = async (fileName) => {

//     let data = JSON.parse(fs.readFileSync("./dumpdata/templates/" + fileName));
//     for (let i = 1; i < data.length; i++) {
//         let templateData = data[i];
//         let templateDetails = {
//             name: templateData.name,
//             data: templateData.data,
//             image: templateData.image
//         };
//         let templateInstance = await templateSchema.create(templateDetails);
//         if (i % 100 == 0) {
//             console.log("Done with " + i + " records");
//         }
//     }

//     return "Done";

// };

// module.exports = dumpTemplate;