// const mongoose = require('mongoose');
// const newsModel = require('./models/newsModel');

// mongoose.connect('mongodb+srv://pancham047:vVs7jQEifTMefzyc@cluster0.o5koy.mongodb.net/')
//   .then(() => {
//     console.log('Connected to MongoDB');
//     return updateOldNews();
//   })
//   .catch(err => console.error('DB connection error:', err));

// async function updateOldNews() {
//   try {
//     const result = await newsModel.updateMany(
//       {
//         $or: [
//           { comments: { $exists: false } },
//           { likes: { $exists: false } }
//         ]
//       },
//       {
//         $set: {
//           comments: [],
//           likes: []
//         }
//       }
//     );
//     console.log(`✅ Updated ${result.modifiedCount} documents`);
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Error updating news:', err);
//     process.exit(1);
//   }
// }
