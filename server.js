const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection String
// Use a real URI in production via environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiro_olimpico';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
    .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// --- SCHEMAS ---

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);
const Contact = mongoose.model('Contact', contactSchema);

// --- ROUTES ---

// Endpoint to create a booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { name, email, phone, date, time } = req.body;
        if (!name || !email || !date || !time) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
        }
        const newBooking = new Booking({ name, email, phone, date, time });
        await newBooking.save();
        res.status(201).json({ message: 'Agendamento realizado com sucesso!', booking: newBooking });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar agendamento' });
    }
});

// Endpoint to send a contact message
app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
        }
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

// Admin login (simples para demo)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'fake-jwt-token' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
});

// Admin endpoint to get bookings
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});

// Admin endpoint to get contacts
app.get('/api/admin/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ date: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar contactos' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
