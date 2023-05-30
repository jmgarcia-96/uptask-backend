import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

// Configurar CORS
const whitelist = [process.env.FRONTEND_URL_LH, process.env.FRONTEND_URL_LH_IP];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Error de Cors"));
    }
  },
};

app.use(cors(corsOptions));

// ROUTING
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// SOCKET.IO

import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL_LH_IP,
  },
});

io.on("connection", (socket) => {
  console.log("Conectado a socket.io");

  // Definir los eventos de socket.io

  socket.on("abrir proyecto", (proyectoId) => {
    socket.join(proyectoId);
  });

  socket.on("nueva-tarea", (tarea) => {
    socket.to(tarea?.proyecto).emit("tarea-agregada", tarea);
  });

  socket.on("eliminar-tarea", (tarea) => {
    socket.to(tarea?.proyecto).emit("tarea-eliminada", tarea);
  });

  socket.on("actualizar-tarea", (tarea) => {
    socket.to(tarea?.proyecto?._id).emit("tarea-actualizada", tarea);
  });

  socket.on("cambiar-estado", (tarea) => {
    socket.to(tarea?.proyecto?._id).emit("nuevo-estado", tarea);
  });
});
