# IMF Gadgets

A backend API using Node.js and Typescript with PostgreSQL (Prisma ORM) to manage the gadgets of IMF.

## Developing Locally

Pull the code and install dependencies:
```
git clone git@github.com:sudhanshuv1/imf-gadgets.git
cd imf-gadgets && npm install
```

This project uses Gemini for Google Cloud and Vertex AI APIs from Google Cloud Platform to generate unique gadget names. Create a project with these APIs enabled and set environment variables. If you are using ADC to get the key, you can export the JSON file with the keys in the terminal:
```
export GOOGLE_APPLICATION_CREDENTIALS="./path-to-application-credentials.json"
```

You need the URI of a Postgres database to configure Prisma schema. Create a `.env` in the root and set these variables:

```
DATABASE_URL
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
GOOGLE_CLOUD_PROJECT_ID
GOOGLE_CLOUD_LOCATION
```

Map your data model to Prisma schema:
```
npx prisma migrate dev --name init
```

To start the server, run:
```
npm run dev
```

---

Live deployment link: https://imf-gadgets-vlax.onrender.com