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
                formatAddress,
                deviceId,
                deviceName,
                os: bodyOs,
                browser: bodyBrowser,
                timezone,
                language,
                screenWidth,
                screenHeight
            } = req.body;

            // User Agent Parsing
            const parser = new UAParser(req.headers["user-agent"]);
            const result = parser.getResult();

            const browser = bodyBrowser || result.browser.name || "";
            const browserVersion = result.browser.version || "";

            const os = bodyOs || result.os.name || "";
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
            let address = formatAddress || "";

            // Reverse Geocoding fallback if formatAddress not provided
            if (latitude && longitude && !formatAddress) {
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
                    region = data.address?.state || data.address?.province || region;
                    city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || city;
                } catch (err) {
                    console.log("Reverse Geocoding Error:", err.message);
                }
            }

            const formattedAddr = formatAddress || address || "";
            const cleanDeviceId = deviceId || (ip ? `ip_${ip.replace(/[^a-zA-Z0-9]/g, '_')}` : undefined);

            // Check if visitor record already exists for this deviceId or IP+Address combination
            let existing = null;
            if (cleanDeviceId) {
                existing = await ClickAnalytics.findOne({ deviceId: cleanDeviceId });
            }
            if (!existing && ip && formattedAddr) {
                existing = await ClickAnalytics.findOne({ ip, formatAddress: formattedAddr });
            }

            if (existing) {
                existing.visitCount = (existing.visitCount || 1) + 1;
                existing.lastVisitedAt = new Date();
                if (latitude) existing.latitude = latitude;
                if (longitude) existing.longitude = longitude;
                if (formattedAddr) {
                    existing.formatAddress = formattedAddr;
                    existing.address = formattedAddr;
                }
                if (cleanDeviceId && !existing.deviceId) existing.deviceId = cleanDeviceId;
                if (deviceName) existing.deviceName = deviceName;
                if (browser) existing.browser = browser;
                if (os) existing.os = os;
                if (city) existing.city = city;
                if (country) existing.country = country;
                if (region) existing.region = region;
                
                await existing.save();

                return res.status(200).json({
                    success: true,
                    message: "Visitor Analytics Updated",
                    data: existing
                });
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
                address: formattedAddr,
                formatAddress: formattedAddr,
                deviceId: cleanDeviceId,
                deviceName: deviceName || (device === 'Desktop' ? 'PC' : 'Mobile'),
                visitCount: 1,
                lastVisitedAt: new Date(),
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

    getAnalytics = async (req, res) => {
        try {
            const analytics = await ClickAnalytics.find()
                .sort({ lastVisitedAt: -1, updatedAt: -1, createdAt: -1 })
                .limit(100);

            const totalClicks = analytics.reduce((acc, curr) => acc + (curr.visitCount || 1), 0);

            return res.status(200).json({
                success: true,
                count: analytics.length,
                totalClicks,
                analytics
            });
        } catch (error) {
            console.error("Error fetching analytics:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    };

}

module.exports = new AnalyticsController();