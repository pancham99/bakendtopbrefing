const mongoose = require("mongoose");
const newsModel = require("./models/newsModel");

const MONGODB_URI =
  "mongodb+srv://pancham047:vVs7jQEifTMefzyc@cluster0.o5koy.mongodb.net/";

async function updateOldDocuments() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB Connected");

    const allNews = await newsModel.find({});

    console.log(`Found ${allNews.length} news documents`);

    const bulkOperations = allNews.map((news) => ({
      updateOne: {
        filter: { _id: news._id },

        update: {
          $set: {
            keywords: news.keywords || [],

            ogImage: news.image || "",

            canonicalUrl: `https://www.topbriefing.in/news/${news.slug}`,

            shortDescription: news.description
              ? news.description
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 200)
              : "",

            // Add this field to old documents
            isHestory: false,
          },
        },
      },
    }));

    if (bulkOperations.length === 0) {
      console.log("No documents found.");
      return;
    }

    const result = await newsModel.bulkWrite(bulkOperations);

    console.log("Migration completed successfully");
    console.log("Matched:", result.matchedCount);
    console.log("Modified:", result.modifiedCount);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  }
}

updateOldDocuments();