const {model, Schema} = require('mongoose');

const videoYoutubeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('videoyoutube', videoYoutubeSchema);