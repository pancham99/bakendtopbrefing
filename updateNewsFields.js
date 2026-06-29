const mongoose = require("mongoose");
const newsModel = require("./models/newsModel");

mongoose
  .connect(
    "mongodb+srv://pancham047:vVs7jQEifTMefzyc@cluster0.o5koy.mongodb.net/"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

async function updateOldDocuments() {
  try {
    const allNews = await newsModel.find({});

    console.log(`Found ${allNews.length} news documents`);

    const bulkOperations = allNews.map((news) => ({
      updateOne: {
        filter: { _id: news._id },
        update: {
          $set: {
            keywords: [],
            ogImage: news.image || "",
            canonicalUrl: `https://www.topbriefing.in/news/${news.slug}`,
            shortDescription: news.description
              ? news.description.replace(/<[^>]*>/g, "").substring(0, 200)
              : "",
          },
        },
      },
    }));

    const result = await newsModel.bulkWrite(bulkOperations);

    console.log("Matched:", result.matchedCount);
    console.log("Modified:", result.modifiedCount);

    mongoose.disconnect();
  } catch (error) {
    console.log(error);
    mongoose.disconnect();
  }
}

updateOldDocuments();

// const mongoose = require("mongoose")
// const newsModel = require("./models/newsModel")

// mongoose.connect("mongodb+srv://pancham047:vVs7jQEifTMefzyc@cluster0.o5koy.mongodb.net/")

// async function updateOldDocuments(){

//   const result = await newsModel.updateMany(
//     {},
//     {
//       $set: {
//         isBreaking: false,
//         isTrending: false,
//         isPopular: false,
//         isFeatured: false,
//         views: 0,
//         priority: 0
//       }
//     }
//   )

//   console.log("Updated Documents:", result.modifiedCount)

//   mongoose.disconnect()
// }

// updateOldDocuments()
