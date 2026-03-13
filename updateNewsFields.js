// const mongoose = require('mongoose');
// const newsModel = require('./models/newsModel');

// mongoose.connect("mongodb+srv://pancham047:vVs7jQEifTMefzyc@cluster0.o5koy.mongodb.net/");

// function generateHindiSlug(title) {
//     return title
//         .toLowerCase()
//         .trim()
//         .replace(/[^\p{L}\p{N}]+/gu, "-")
//         .replace(/-+/g, "-")
//         .replace(/^-+|-+$/g, "");
// }

// async function fixSlugs() {
//     try {
//         const allNews = await newsModel.find();
//         console.log(`Total news found: ${allNews.length}`);

//         for (let item of allNews) {
//             const newSlug = generateHindiSlug(item.title);

//             await newsModel.updateOne(
//                 { _id: item._id },
//                 { $set: { slug: newSlug } }
//             );

//             console.log(`Updated: ${item.title} → ${newSlug}`);
//         }

//         console.log("🔥 All old slugs updated successfully!");
//         process.exit(0);

//     } catch (err) {
//         console.error("Error fixing slugs:", err);
//         process.exit(1);
//     }
// }

// fixSlugs();



const mongoose = require("mongoose")
const newsModel = require("./models/newsModel")

mongoose.connect("mongodb+srv://pancham047:vVs7jQEifTMefzyc@cluster0.o5koy.mongodb.net/")

async function updateOldDocuments(){

  const result = await newsModel.updateMany(
    {},
    {
      $set: {
        isBreaking: false,
        isTrending: false,
        isPopular: false,
        isFeatured: false,
        views: 0,
        priority: 0
      }
    }
  )

  console.log("Updated Documents:", result.modifiedCount)

  mongoose.disconnect()
}

updateOldDocuments()





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
