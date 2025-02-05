const sendMessage= async () => {
    const userPrompt = document.getElementById('userPrompt').value;
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = '<em>Loading...</em>';
    //const API_KEY = "__GROQ_API_KEY__"; // Placeholder, will be replaced during deployment
    //const apiKey = process.env.GROQ_API_KEY; // Use environment variable for security
    const apiKey =  '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'
    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";


    if (!userPrompt.trim()) {
        responseDiv.innerHTML = '<em>Please enter a message.</em>';
        return;
    }

    const requestBody = {
        messages: [{ role: 'user', content: userPrompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        responseDiv.innerHTML = ""; // Clear loading text


        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            // Process each chunk as JSON
            const chunkLines = chunk.split("\n").filter(line => line.trim() !== "");

            for (let line of chunkLines) {
                if (line.startsWith("data: ")) {
                    const jsonString = line.replace("data: ", "").trim();
                    try {
                        const parsedData = JSON.parse(jsonString);
                        const messageContent = parsedData.choices?.[0]?.delta?.content || "";
                        accumulatedText += messageContent;
                        responseDiv.innerHTML = accumulatedText; // Update the UI dynamically
                    } catch (error) {
                        console.error("Error parsing JSON chunk:", error);
                    }
                }
            }
        }

    } catch (error) {
        console.error("Error fetching Groq response:", error);
        responseDiv.innerHTML = '<em>Error processing your request.</em>';

    }
};

//fetchGroqChatCompletion();
