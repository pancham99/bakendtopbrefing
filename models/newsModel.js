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





