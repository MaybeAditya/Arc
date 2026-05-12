import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Vercel will pull this key securely from your project settings
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert luxury appraiser for the Arc Protocol. 
        Analyze the provided data. Estimate how long the item has been used and 
        calculate the estimated carbon footprint saved by keeping it in circulation. 
        Format the response in short HTML.`;

        // For this simple example, we are just sending a text prompt.
        // To send the image from the camera, you would pass the base64 image data here.
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Send the AI's answer back to your frontend
        res.status(200).json({ success: true, aiAnalysis: responseText });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Failed to analyze asset." });
    }
}