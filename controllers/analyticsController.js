const axios = require("axios");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

const ClickAnalytics = require("../models/analyticsModel");

class AnalyticsController {

    newsClick = async (req, res) => {

        try {

            const {
                latitude,
                longitude,
                timezone,
                language,
                screenWidth,
                screenHeight
            } = req.body;

            // User Agent
            const parser = new UAParser(req.headers["user-agent"]);
            const result = parser.getResult();

            const browser = result.browser.name || "";
            const browserVersion = result.browser.version || "";

            const os = result.os.name || "";
            const osVersion = result.os.version || "";

            const device = result.device.type || "Desktop";
            const vendor = result.device.vendor || "";

            // Client IP
            const ip =
                req.headers["x-forwarded-for"]?.split(",")[0] ||
                req.socket.remoteAddress ||
                req.ip;

            // GeoIP (Fallback)
            const geo = geoip.lookup(ip);

            let country = geo?.country || "";
            let region = geo?.region || "";
            let city = geo?.city || "";
            let address = "";

            // Reverse Geocoding
            if (latitude && longitude) {

                try {

                    const { data } = await axios.get(
                        "https://nominatim.openstreetmap.org/reverse",
                        {
                            params: {
                                lat: latitude,
                                lon: longitude,
                                format: "json"
                            },
                            headers: {
                                "User-Agent": "TopBriefing/1.0"
                            }
                        }
                    );

                    address = data.display_name || "";

                    country = data.address?.country || country;

                    region =
                        data.address?.state ||
                        data.address?.province ||
                        region;

                    city =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.county ||
                        city;

                } catch (err) {

                    console.log("Reverse Geocoding Error:", err.message);

                }

            }

            const analytics = await ClickAnalytics.create({

                ip,

                browser,
                browserVersion,

                os,
                osVersion,

                device,
                vendor,

                latitude,
                longitude,

                country,
                region,
                city,
                address,

                timezone,

                language,

                screenWidth,
                screenHeight,

                referer: req.headers.referer || ""

            });

            return res.status(201).json({
                success: true,
                message: "Visitor Analytics Saved",
                data: analytics
            });

        } catch (error) {

            console.error("Analytics Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });

        }

    };

}

module.exports = new AnalyticsController();