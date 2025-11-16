const { formidable } = require('formidable');
const cloudinary = require('cloudinary').v2;
const newsModel = require('../models/newsModel');
const authModel = require('../models/authModel');
const galleryModel = require('../models/galleryModel');
const subscriberModel = require('../models/subscriberModel'); // model for subscribers (email list)
const sendMail = require('../utils/sendMail'); // utility function to send emails
const { mongo: { ObjectId } } = require('mongoose');

const moment = require('moment');


class newsController {
    // add_news = async (req, res) => {
    //     const { id, category, name } = req.userInfo

    //     const form = formidable({})
    //     cloudinary.config({
    //         cloud_name: process.env.CLODINARY_CLOUD_NAME,
    //         api_key: process.env.CLODINARY_API_KEY,
    //         api_secret: process.env.CLODINARY_API_SECRET_KEY,
    //         secure: true
    //     })

    //     try {
    //         const [fields, files] = await form.parse(req)

    //         const { url } = await cloudinary.uploader.upload(files.image[0].filepath, { folder: 'news_images' })
    //         const { title, description, state } = fields
    //         const finalCategory = state && state[0]?.trim() !== "" ? null : category;
    //         const news = await newsModel.create({
    //             writerId: id,
    //             title: title[0].trim(),
    //             slug: title[0].trim().toLowerCase().replace(/\s+/g, '-'),
    //             category: finalCategory,
    //             state: state[0].trim(),
    //             description: description[0],
    //             image: url,
    //             date: moment().format('LL'),
    //             writerName: name,
    //             count: 0
    //         })

    //         console.log(news)

    //         return res.status(200).json({ message: 'news added successfully', news })

    //     } catch (error) {
    //         return res.status(500).json({ message: 'internal server error' })
    //     }
    // }

    // add_news = async (req, res) => {
    //     const { id, category, name } = req.userInfo;

    //     const form = formidable({});
    //     cloudinary.config({
    //         cloud_name: process.env.CLODINARY_CLOUD_NAME,
    //         api_key: process.env.CLODINARY_API_KEY,
    //         api_secret: process.env.CLODINARY_API_SECRET_KEY,
    //         secure: true
    //     });

    //     try {
    //         const [fields, files] = await form.parse(req);
    //         const { url } = await cloudinary.uploader.upload(files.image[0].filepath, { folder: 'news_images' });

    //         const { title, description, state } = fields;

    //         // logic: state दिया तो category null कर दो
    //         const finalCategory = state && state[0]?.trim() !== "" ? null : category;

    //         const news = await newsModel.create({
    //             writerId: id,
    //             title: title[0].trim(),
    //             slug: title[0].trim().toLowerCase().replace(/\s+/g, '-'),
    //             category: finalCategory,
    //             state: state[0]?.trim() || null,
    //             description: description[0]?.trim() || null,
    //             image: url,
    //             date: moment().format('LL'),
    //             writerName: name,
    //             count: 0
    //         });

    //         return res.status(200).json({ message: 'news added successfully', news });

    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ message: 'internal server error' });
    //     }
    // }



    add_news = async (req, res) => {
        const { id, category, name } = req.userInfo;

        const form = formidable({});
        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        });

        try {
            const [fields, files] = await form.parse(req);
            const { title, description, state } = fields;

            // Upload image to cloudinary
            const { url } = await cloudinary.uploader.upload(files.image[0].filepath, {
                folder: 'news_images'
            });

            // If `state` is given, nullify category
            const finalCategory = state && state[0]?.trim() !== "" ? null : category;

            // Create news entry
            const news = await newsModel.create({
                writerId: id,
                title: title[0].trim(),
                slug: title[0].trim().toLowerCase().replace(/\s+/g, '-'),
                category: finalCategory,
                state: state[0]?.trim() || null,
                description: description[0]?.trim() || null,
                image: url,
                date: moment().format('LL'),
                writerName: name,
                count: 0
            });

            // Fetch all subscribers
            const subscribers = await subscriberModel.find({}, 'email');

            if (subscribers.length > 0) {
                // Prepare email content
                const subject = `📰 New News Published: ${title[0].trim()}`;
                // const newsLink = `https://www.topbriefing.in/`;
                const message = `
                <h2>${title[0].trim()}</h2>
                <p>${description[0]?.trim()?.slice(0, 150)}...</p>
                <a href="https://www.topbriefing.in/" 
                    style="display:inline-block;margin-top:10px;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
                    Read Full Article
                </a>
                <br><br>
                <small>Published by ${name} on ${moment().format('LL')}</small>
            `;

                // Send emails in background (not blocking response)
                subscribers.forEach(sub => {
                    sendMail(sub.email, subject, message).catch(err =>
                        console.error(`Failed to send mail to ${sub.email}:`, err)
                    );
                });
            }

            return res.status(200).json({
                message: 'News added successfully and notifications sent to subscribers.',
                news
            });

        } catch (error) {
            console.error('Error adding news:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };


    update_news = async (req, res) => {
        const { news_id } = req.params
        const form = formidable({})
        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        })

        try {
            const [fields, files] = await form.parse(req)

            const { title, description } = fields
            let url = fields.old_image[0]

            if (Object.keys(files).length > 0) {
                const splitImage = url.split('/')
                const imagesFile = splitImage[splitImage.length - 1].split('.')[0]
                await cloudinary.uploader.destroy(imagesFile)
                const data = await cloudinary.uploader.upload(files.new_image[0].filepath, { folder: 'news_images' })
                url = data.url

            }

            const news = await newsModel.findByIdAndUpdate(news_id, {
                title: title[0].trim(),
                slug: title[0].trim().split('').join('-'),
                description: description[0],
                image: url,
            }, { new: true })

            return res.status(200).json({ message: 'news update successfully', news })
        } catch (error) {
            return res.status(500).json({ message: 'internal server error' })
        }

    }

    update_news_status = async (req, res) => {
        const { role } = req.userInfo
        const { news_id } = req.params
        const { status } = req.body

        if (role === 'admin') {
            const news = await newsModel.findByIdAndUpdate(news_id, { status }, { new: true })
            return res.status(200).json({ message: 'news status update successfully', news })
        } else {
            return res.status(401).json({ message: 'you cannot access this api server error' })
        }

    }

    get_images = async (req, res) => {
        const { id } = req.userInfo

        try {
            const images = await galleryModel.find({ writerId: ObjectId(id) }).sort({ createdAt: -1 })
            return res.status(200).json({ images })

        } catch (error) {
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    add_images = async (req, res) => {
        const form = formidable({})
        const { id } = req.userInfo

        cloudinary.config({
            CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
            api_key: process.env.api_key,
            api_JWT_SECRET: process.env.api_JWT_SECRET,
            secure: true
        })

        try {
            const [_, files] = await form.parse(req)
            let allImages = []
            const { images } = files

            for (let i = 0; i < images.length; i++) {
                const { url } = await cloudinary.uploader.upload(images[i].filepath, { folder: 'news_images' })
                allImages.push({ writerId: id, url })
            }

            const image = await galleryModel.insertMany(allImages)
            return res.status(200).json({ images: image, message: 'images added successfully' })

        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }

    }

    get_dashboard_news = async (req, res) => {
        const { id, role } = req.userInfo

        try {
            if (role === 'admin') {
                const news = await newsModel.find({}).sort({ createdAt: -1 })
                return res.status(201).json({ news })
            } else {
                const news = await newsModel.find({ writerId: new ObjectId(id) }).sort({ createdAt: -1 })
                return res.status(201).json({ news })
            }
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    get_dashboard_single_news = async (req, res) => {
        const { news_id } = req.params

        try {
            const news = await newsModel.findById(news_id)
            return res.status(201).json({ news })

        } catch (error) {
            return res.status(500).json({ message: 'internal server error' })
        }

    }

    get_all_news = async (req, res) => {
        try {
            const category_news = await newsModel.aggregate([
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $match: {
                        status: 'active'
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        news: {
                            $push: {
                                id: '$_id',
                                title: '$title',
                                slug: '$slug',
                                writerName: '$writerName',
                                image: '$image',
                                description: '$description',
                                date: '$date',
                                category: '$category',
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        category: '$_id',
                        news: {
                            $slice: ['$news', 5]
                        }
                    }
                }
            ])

            const news = {}
            for (let i = 0; i < category_news.length; i++) {
                news[category_news[i].category] = category_news[i].news
            }
            return res.status(200).json({ news })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    get_news = async (req, res) => {
        const { slug } = req.params
        try {
            const news = await newsModel.findOneAndUpdate({ slug }, { $inc: { count: 1 } }, { new: true })

            const relatedNews = await newsModel.find({
                $and: [
                    {
                        slug: { $ne: slug }
                    },
                    {
                        category: {
                            $eq: news.category
                        }
                    }
                ]
            }).limit(5).sort({ createdAt: -1 })

            return res.status(200).json({ news: news ? news : {}, relatedNews })

        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    get_categories = async (req, res) => {
        try {
            const categories = await newsModel.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        category: '$_id',
                        count: 1
                    }
                }
            ])
            return res.status(200).json({ categories })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    get_category_by_name = async (req, res) => {
        const { category } = req.params;

        try {
            const news = await newsModel.findOneAndUpdate({ category }, { $inc: { count: 1 } }, { new: true })

            const relatedNews = await newsModel.find({
                $and: [
                    {
                        category: { $ne: category }
                    },
                    {
                        category: {
                            $eq: news.category
                        }
                    }
                ]
            }).limit(5).sort({ createdAt: -1 })

            return res.status(200).json({ news: news ? news : {}, relatedNews })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }
    };

    get_popular_news = async (req, res) => {
        try {
            const popularNews = await newsModel.find({ status: 'active' }).sort({ count: -1 }).limit(4)
            return res.status(200).json({ popularNews })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    get_latest_news = async (req, res) => {
        try {
            const latestNews = await newsModel.find({ status: 'active' }).sort({ createdAt: -1 }).limit(6)
            return res.status(200).json({ latestNews })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    // delete_news = async (req, res) => {
    //     const { news_id } = req.params
    //     const { role } = req.userInfo

    //     if (role === 'admin') {
    //         try {
    //             const news = await newsModel.findByIdAndDelete(news_id)
    //             if (!news) {
    //                 return res.status(404).json({ message: 'news not found' })
    //             }
    //             return res.status(200).json({ message: 'news deleted successfully', status: 'success' })
    //         } catch (error) {
    //             console.log(error.message)
    //             return res.status(500).json({ message: 'internal server error' })
    //         }
    //     } else {
    //         return res.status(401).json({ message: 'you cannot access this api server error' })
    //     }
    // }


    delete_news = async (req, res) => {
        const { news_id } = req.params
        const { role } = req.userInfo

        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        });

        if (role === 'admin') {
            try {
                // Find the news first to get the image URL
                const news = await newsModel.findById(news_id)
                if (!news) {
                    return res.status(404).json({ message: 'news not found' })
                }

                // Extract public_id from the image URL
                if (news.image) {
                    const urlParts = news.image.split('/');
                    const fileName = urlParts[urlParts.length - 1];
                    const publicId = 'news_images/' + fileName.split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }

                // Now delete the news document
                await newsModel.findByIdAndDelete(news_id);

                return res.status(200).json({ message: 'news deleted successfully', status: 'success' })
            } catch (error) {
                console.log(error.message)
                return res.status(500).json({ message: 'internal server error' })
            }
        } else {
            return res.status(401).json({ message: 'you cannot access this api server error' })
        }
    }

    delete_multiple_news = async (req, res) => {
        const { newsId } = req.body;
        const { role } = req.userInfo;

        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        });

        if (role !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        if (!Array.isArray(newsId) || newsId.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty newsId array' });
        }

        try {
            // Find all news by newsId
            const newsItems = await newsModel.find({ _id: { $in: newsId } });

            // Delete images from Cloudinary if present
            for (const news of newsItems) {
                if (news.image) {
                    const urlParts = news.image.split('/');
                    const fileName = urlParts[urlParts.length - 1];
                    const publicId = 'news_images/' + fileName.split('.')[0];

                    try {
                        await cloudinary.uploader.destroy(publicId);
                    } catch (cloudErr) {
                        console.warn(`Failed to delete image for ${news._id}:`, cloudErr.message);
                    }
                }
            }

            // Delete news items from DB
            await newsModel.deleteMany({ _id: { $in: newsId } });

            return res.status(200).json({ message: 'Selected news deleted successfully', status: 'success' });
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }



    get_news_state = async (req, res) => {
        const { state } = req.params

        try {
            const news = await newsModel.find({ state }).sort({ createdAt: -1 })
            if (news.length === 0) {
                return res.status(404).json({ message: 'No news found for this state' });
            }
            return res.status(200).json({ news });
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    get_seach_news = async (req, res) => {
        const { search } = req.query;
        console.log(req.query, "search query");

        if (!search) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        try {
            const news = await newsModel.find({
                title: { $regex: search, $options: 'i' }
            }).sort({ createdAt: -1 });

            if (news.length === 0) {
                return res.status(404).json({ message: 'No news found for this search query' });
            }

            return res.status(200).json({ news });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    get_recent_news = async (req, res) => {
        try {
            const recentNews = await newsModel.find({ status: 'active' }).limit(10).sort({ createdAt: -1 })
            return res.status(200).json({ recentNews });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: 'internal server error' });
        }
    }





}


module.exports = new newsController();