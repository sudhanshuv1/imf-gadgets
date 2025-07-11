import express from 'express';
import gadgetsRoutes from './routes/gadgetsRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import path from 'path';
import { logger } from './middleware/logger';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());


app.use(logger);

app.use('/gadgets', gadgetsRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.all('/{*any}', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '..', 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});