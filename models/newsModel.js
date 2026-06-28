const { model, Schema } = require("mongoose")

const newsSchema = new Schema({

  writerId: {
    type: Schema.Types.ObjectId,
    ref: "authors",
    required: true,
    index: true
  },

  writerName: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  image: {
    type: String,
    required: true
  },

  keywords: [{
    type: String,
    trim: true
  }],

  ogImage: {
    type: String,
    default: ""
  },

  canonicalUrl: {
    type: String,
    default: ""
  },

  category: {
    type: String,
    index: true
  },

  description: {
    type: String,
    default: ""
  },

  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  date: {
    type: Date,
    default: Date.now,
    index: true
  },

  status: {
    type: String,
    enum: ["active", "pending", "deactive"],
    default: "pending",
    index: true
  },

  state: {
    type: String,
    default: "",
    index: true
  },

  views: {
    type: Number,
    default: 0,
    index: true
  },

  count: {
    type: Number,
    default: 0
  },

  // NEWS TYPES
  isBreaking: {
    type: Boolean,
    default: false,
    index: true
  },

  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },

  isTrending: {
    type: Boolean,
    default: false,
    index: true
  },

  isPopular: {
    type: Boolean,
    default: false,
    index: true
  },

  priority: {
    type: Number,
    default: 0
  },

  tags: [
    {
      type: String
    }
  ],

  readingTime: {
    type: Number,
    default: 2
  },

  metaTitle: {
    type: String,
    default: ""
  },

  metaDescription: {
    type: String,
    default: ""
  },

  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],

  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Like"
    }
  ]

}, { timestamps: true })

/* INDEXES */
// newsSchema.index({ slug: 1 });
newsSchema.index({ status: 1, createdAt: -1 })
newsSchema.index({ category: 1, createdAt: -1 })
newsSchema.index({ views: -1 })
newsSchema.index({ isBreaking: 1, createdAt: -1 })
newsSchema.index({ isTrending: 1, createdAt: -1 })

newsSchema.index({ isPopular: 1, createdAt: -1 })
newsSchema.index({ writerId: 1, createdAt: -1 })

module.exports = model("news", newsSchema)






// const { Schema, model } = require("mongoose");

// const newsSchema = new Schema(
//   {
//     /* ---------------- AUTHOR ---------------- */

//     writerId: {
//       type: Schema.Types.ObjectId,
//       ref: "authors",
//       required: true,
//       index: true
//     },

//     writerName: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     updatedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "authors"
//     },

//     publishedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "authors"
//     },

//     /* ---------------- CONTENT ---------------- */

//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200
//     },

//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true
//     },

//     summary: {
//       type: String,
//       trim: true,
//       maxlength: 300
//     },

//     description: {
//       type: String,
//       default: ""
//     },

//     image: {
//       type: String,
//       required: true
//     },

//     thumbnail: {
//       type: String,
//       default: ""
//     },

//     /* ---------------- CATEGORY ---------------- */

//     category: {
//       type: String,
//       required: true,
//       index: true
//     },

//     tags: [
//       {
//         type: String,
//         trim: true,
//         lowercase: true
//       }
//     ],

//     state: {
//       type: String,
//       default: "",
//       index: true
//     },

//     location: {
//       type: String,
//       trim: true
//     },

//     language: {
//       type: String,
//       default: "hi",
//       index: true
//     },

//     source: {
//       type: String,
//       default: ""
//     },

//     /* ---------------- STATUS ---------------- */

//     status: {
//       type: String,
//       enum: ["active", "pending", "deactive"],
//       default: "pending",
//       index: true
//     },

//     isDeleted: {
//       type: Boolean,
//       default: false
//     },

//     /* ---------------- NEWS FLAGS ---------------- */

//     isBreaking: {
//       type: Boolean,
//       default: false,
//       index: true
//     },

//     isFeatured: {
//       type: Boolean,
//       default: false,
//       index: true
//     },

//     isTrending: {
//       type: Boolean,
//       default: false,
//       index: true
//     },

//     isPopular: {
//       type: Boolean,
//       default: false,
//       index: true
//     },

//     priority: {
//       type: Number,
//       default: 0
//     },

//     featuredOrder: {
//       type: Number,
//       default: 0
//     },

//     /* ---------------- ANALYTICS ---------------- */

//     views: {
//       type: Number,
//       default: 0
//     },

//     uniqueViews: {
//       type: Number,
//       default: 0
//     },

//     likeCount: {
//       type: Number,
//       default: 0
//     },

//     commentCount: {
//       type: Number,
//       default: 0
//     },

//     shareCount: {
//       type: Number,
//       default: 0
//     },

//     /* ---------------- SEO ---------------- */

//     metaTitle: {
//       type: String,
//       trim: true,
//       maxlength: 160
//     },

//     metaDescription: {
//       type: String,
//       trim: true,
//       maxlength: 300
//     },

//     metaKeywords: [
//       {
//         type: String,
//         trim: true
//       }
//     ],

//     /* ---------------- TIME ---------------- */

//     readingTime: {
//       type: Number,
//       default: 2
//     },

//     publishedAt: {
//       type: Date,
//       index: true
//     },

//     scheduledAt: {
//       type: Date
//     },

//     /* ---------------- RELATIONS ---------------- */

//     comments: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Comment"
//       }
//     ],

//     likes: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Like"
//       }
//     ]
//   },
//   {
//     timestamps: true,
//     versionKey: false
//   }
// );

// /* ---------------- INDEXES ---------------- */

// // Dashboard
// newsSchema.index({ status: 1, createdAt: -1 });

// // Category page
// newsSchema.index({ category: 1, status: 1, createdAt: -1 });

// // Breaking news
// newsSchema.index({ isBreaking: 1, createdAt: -1 });

// // Trending
// newsSchema.index({ isTrending: 1, views: -1 });

// // Popular
// newsSchema.index({ isPopular: 1, views: -1 });

// // Writer news
// newsSchema.index({ writerId: 1, createdAt: -1 });

// // State news
// newsSchema.index({ state: 1, createdAt: -1 });

// // Published news
// newsSchema.index({ publishedAt: -1 });

// // Priority sorting
// newsSchema.index({ priority: -1 });

// // Views sorting
// newsSchema.index({ views: -1 });

// // Search optimization
// newsSchema.index({
//   title: "text",
//   summary: "text",
//   description: "text",
//   tags: "text"
// });

// module.exports = model("news", newsSchema);

