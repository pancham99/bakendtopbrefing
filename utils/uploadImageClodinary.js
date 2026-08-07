const cloudinary = require('cloudinary').v2;

cloudinary.config({
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    api_key: process.env.api_key,
    api_JWT_SECRET: process.env.api_JWT_SECRET,
    secure: true
})

const uploadImageClodinary = async (image) => {
    const buffer = image?.buffer || Buffer.from(await image.arrayBuffer())

    const uploadImage = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "binkeyit" }, (error, uploadResult) => {
            return resolve(uploadResult)
        }).end(buffer)
    })

    return uploadImage
}

export default uploadImageClodinary
