export const handler = async () => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({
      geminiConfigured,
      firebaseConfigured: false,
      systemInfo: {
        platform: 'Netlify Functions + React Vite',
        method: 'Método Larissa - RDO Inteligente',
        modelUsed: 'gemini-3.8-flash',
      },
    }),
  };
};
