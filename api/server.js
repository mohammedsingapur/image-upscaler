// api/server.js
export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, apiKey, image, predictionUrl } = req.body;

    if (!apiKey) {
        return res.status(401).json({ error: 'Missing API Key' });
    }

    // 2. Handle "Create" Request (Start the AI)
    if (action === 'create') {
        try {
            const response = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // Real-ESRGAN Model
                    version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
                    input: {
                        image: image,
                        scale: 8,
                        face_enhance: true
                    }
                })
            });

            const data = await response.json();
            if (response.status !== 201) {
                return res.status(500).json({ error: data.detail || "Failed to start AI" });
            }
            return res.status(200).json(data);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // 3. Handle "Check" Request (Poll for results)
    if (action === 'check') {
        try {
            const response = await fetch(predictionUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${apiKey}`,
                    "Content-Type": "application/json",
                }
            });

            const data = await response.json();
            return res.status(200).json(data);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(400).json({ error: "Invalid Action" });
}
