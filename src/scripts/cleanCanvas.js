// const canvas = require("../schema/canvasSchema");
// const { Op } = require("sequelize");

// const cleanCanvas = async () => {
//   // await canvas.update(
//   //     assets[i],
//   //     {
//   //         where: {
//   //             id: id,
//   //         },
//   //     }
//   // );

//   // remove all null elements from referredFrom field

//   let canvases = await canvas.findAll();

//   console.log(canvases.length);

//   for (let i = 0; i < canvases.length; i++) {
//     let id = canvases[i].id;

//     await canvas.update(
//       {
//         imageLink: canvases[i].imageLink === null ? [] : canvases[i].imageLink,
//         // params : canvases[i].params === null ? {} : canvases[i].params,
//       },
//       {
//         where: {
//           id: id,
//         },
//       }
//     );

//     console.log(i > 0 ? (i / canvases.length) * 100 : 0);
//   }

//   console.log("done");
// };

// module.exports = cleanCanvas;
